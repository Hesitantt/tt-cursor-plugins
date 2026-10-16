# C# decorators, logging, and metrics

Code examples for the Designing for decorators and Logging and metrics rules in `SKILL.md`. One running example: an order service, wrapped by a logging decorator and a metrics decorator.

## Design the service so it can be wrapped

```csharp
public interface IOrderService
{
    Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken);
}

public sealed record PlaceOrder(CustomerId CustomerId, NonEmpty<OrderLine> Lines);

public abstract record PlaceOrderResult
{
    private PlaceOrderResult() { }

    public abstract string Outcome { get; }

    public sealed record Placed(OrderId OrderId) : PlaceOrderResult
    {
        public override string Outcome => "placed";
    }

    public sealed record Rejected(string Reason) : PlaceOrderResult
    {
        public override string Outcome => "rejected";
    }
}

public sealed class OrderService(IOrderRepository orders, IStockService stock, TimeProvider time) : IOrderService
{
    public async Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken)
    {
        if (!await stock.ReserveAsync(command.Lines, cancellationToken))
        {
            return new PlaceOrderResult.Rejected("Out of stock");
        }
        var order = Order.Create(command, time.GetUtcNow());
        await orders.AddAsync(order, cancellationToken);
        return new PlaceOrderResult.Placed(order.Id);
    }
}
```

Each choice here is what lets a decorator stay small and transparent:

- **One member.** The decorator forwards one method. A fat interface makes every decorator a wall of pass-through members.
- **`Task` plus `CancellationToken`.** A decorator can await to time the call, retry it, or add a timeout. A synchronous member that later turns async breaks every decorator.
- **Immutable records in and out.** A decorator can read and log the command without changing what the inner service sees.
- **Outcome in the result.** "Out of stock" is a value, so the metrics decorator tags it without catching an exception.
- **`sealed`, no `virtual`.** Nobody extends `OrderService` by subclassing it and overriding internals.
- **`TimeProvider` injected.** Time is replaceable in tests, the same as everything else.
- **No telemetry in the core.** No logger, `Stopwatch`, or meter. That lives in the decorators.

## Default interface members bypass decorators

```csharp
// Don't
public interface IOrderService
{
    Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken);

    Task<PlaceOrderResult> PlaceSingleAsync(CustomerId customer, OrderLine line, CancellationToken cancellationToken) =>
        PlaceAsync(new PlaceOrder(customer, new NonEmpty<OrderLine>(line, [])), cancellationToken);
}
```

If `OrderService` overrides `PlaceSingleAsync` and a decorator doesn't, calls through the decorator run the default body and never reach the override. Keep decorated interfaces abstract-only. Put convenience overloads in extension methods on the interface, where every decorator sees them the same way.

## Logging decorator

```csharp
public sealed class LoggingOrderService(IOrderService inner, ILogger<IOrderService> logger) : IOrderService
{
    public async Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken)
    {
        var start = Stopwatch.GetTimestamp();
        try
        {
            var result = await inner.PlaceAsync(command, cancellationToken);
            logger.LogInformation(
                "Order for {CustomerId} finished as {Outcome} in {ElapsedMs} ms",
                command.CustomerId, result.Outcome, Stopwatch.GetElapsedTime(start).TotalMilliseconds);
            return result;
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            logger.LogError(
                exception,
                "Order for {CustomerId} failed after {ElapsedMs} ms",
                command.CustomerId, Stopwatch.GetElapsedTime(start).TotalMilliseconds);
            throw;
        }
    }
}
```

- **Constant templates.** `logger.LogInformation($"Order {id}")` or `"Order " + id` destroys the structured property, so `CustomerId` can't be queried, and every distinct value becomes a distinct message (CA2254).
- **Arguments match placeholders.** Values bind by position, not by name. Keep the order of arguments and `{Placeholders}` in step.
- **Guard expensive arguments.** Arguments are evaluated even when the level is off. Wrap a call whose arguments cost something in `if (logger.IsEnabled(LogLevel.Debug))`.
- **`ILogger<IOrderService>`.** The category names the contract, so it doesn't change when the chain is reordered.
- **`throw;`, not `throw exception;`.** The original stack trace survives.
- **Cancellation isn't an error.** The `when` filter lets it pass unlogged.
- **Log context, not payloads.** `CustomerId`, outcome, and duration. Not the order lines, addresses, or payment details.
- **Log the exception once.** This decorator logs and rethrows, so the host's exception handler must not log it again at `Error`. If the host already logs unhandled exceptions with enough context, drop `LogFailed` here instead.

## Metrics decorator

Instruments are created once. Put them in a singleton holder and inject that into the decorator, whatever the decorator's lifetime.

```csharp
public sealed class OrderMetrics
{
    public const string MeterName = "MyApp.Orders";

    public OrderMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create(MeterName);
        PlaceDuration = meter.CreateHistogram<double>(
            "myapp.orders.place.duration",
            unit: "s",
            description: "Time to place an order.");
    }

    public Histogram<double> PlaceDuration { get; }
}

public sealed class MeteredOrderService(IOrderService inner, OrderMetrics metrics) : IOrderService
{
    public async Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken)
    {
        var start = Stopwatch.GetTimestamp();
        var outcome = "error";
        string? errorType = null;
        try
        {
            var result = await inner.PlaceAsync(command, cancellationToken);
            outcome = result.Outcome;
            return result;
        }
        catch (OperationCanceledException)
        {
            outcome = "canceled";
            throw;
        }
        catch (Exception exception)
        {
            errorType = exception.GetType().FullName;
            throw;
        }
        finally
        {
            var tags = new TagList { { "outcome", outcome } };
            if (errorType is not null)
            {
                tags.Add("error.type", errorType);
            }
            metrics.PlaceDuration.Record(Stopwatch.GetElapsedTime(start).TotalSeconds, tags);
        }
    }
}
```

- **`IMeterFactory`, not `new Meter(...)`.** The factory scopes meters to the container, so tests get isolated instruments.
- **Histogram, not histogram plus counter.** A histogram exports a count, so "orders placed" is already there.
- **Seconds, `unit: "s"`.** OpenTelemetry convention for durations. Name instruments lowercase and dotted.
- **`Stopwatch.GetTimestamp()`.** No `Stopwatch` allocation, and unlike `DateTime.Now` it is monotonic.
- **Bounded tags.** `outcome` has four values; `error.type` has as many as there are exception types. Never tag `CustomerId`, `OrderId`, or `exception.Message`: each distinct value creates a new time series.
- **`finally`.** Failed and canceled calls are measured, not only successful ones.

## Tracing decorator

ASP.NET Core, `HttpClient`, and most database clients already create spans. Add one in a decorator only for a domain operation you want to see in the trace.

```csharp
public sealed class TracedOrderService(IOrderService inner) : IOrderService
{
    private static readonly ActivitySource Source = new(OrderMetrics.MeterName);

    public async Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken)
    {
        using var activity = Source.StartActivity("PlaceOrder");
        activity?.SetTag("customer.id", command.CustomerId.ToString());
        try
        {
            var result = await inner.PlaceAsync(command, cancellationToken);
            activity?.SetTag("order.outcome", result.Outcome);
            return result;
        }
        catch (Exception exception)
        {
            activity?.SetStatus(ActivityStatusCode.Error);
            activity?.AddException(exception);
            throw;
        }
    }
}
```

Span tags may hold ids: a span is one event, not a time series. `ActivitySource` is static because it has no per-container state. Logs written inside the span carry its trace id when the logger's activity tracking is on, which replaces hand-built `BeginScope` correlation.

## Registration and order

With Scrutor, each `Decorate` wraps everything registered before it, so the last call is outermost.

```csharp
services.AddSingleton<OrderMetrics>();
services.AddScoped<IOrderService, OrderService>();
services.Decorate<IOrderService, MeteredOrderService>();
services.Decorate<IOrderService, LoggingOrderService>();
// IOrderService resolves to Logging -> Metered -> OrderService
```

Without Scrutor, compose the chain by hand. It reads in the same order it runs.

```csharp
services.AddSingleton<OrderMetrics>();
services.AddScoped<OrderService>();
services.AddScoped<IOrderService>(sp =>
    new LoggingOrderService(
        new MeteredOrderService(
            sp.GetRequiredService<OrderService>(),
            sp.GetRequiredService<OrderMetrics>()),
        sp.GetRequiredService<ILogger<IOrderService>>()));
```

Decide the order by what each layer should see:

| Placement | Sees |
|-----------|------|
| Logging outermost | The final outcome, after retries and fallbacks. |
| Metrics outside a retry | Latency the caller experienced. |
| Metrics inside a retry | Latency and outcome of each attempt. |
| Metrics outside a cache | Hits as fast calls; the hit rate shows in the histogram. |
| Metrics inside a cache | Backend calls only. |

Register `OrderService` only as the innermost link. If it is also reachable as `IOrderService` somewhere else, that caller skips the decorators.

## Open-generic decorators

For many operations with the same shape, one decorator covers them all.

```csharp
public interface ICommandHandler<in TCommand, TResult>
{
    Task<TResult> HandleAsync(TCommand command, CancellationToken cancellationToken);
}

public sealed class LoggingCommandHandler<TCommand, TResult>(
    ICommandHandler<TCommand, TResult> inner,
    ILogger<LoggingCommandHandler<TCommand, TResult>> logger) : ICommandHandler<TCommand, TResult>
{
    public async Task<TResult> HandleAsync(TCommand command, CancellationToken cancellationToken)
    {
        var start = Stopwatch.GetTimestamp();
        var result = await inner.HandleAsync(command, cancellationToken);
        logger.LogDebug(
            "Handled {Command} in {ElapsedMs} ms",
            typeof(TCommand).Name, Stopwatch.GetElapsedTime(start).TotalMilliseconds);
        return result;
    }
}

services.Scan(scan => scan
    .FromAssemblyOf<PlaceOrderHandler>()
    .AddClasses(c => c.AssignableTo(typeof(ICommandHandler<,>)))
    .AsImplementedInterfaces()
    .WithScopedLifetime());
services.Decorate(typeof(ICommandHandler<,>), typeof(LoggingCommandHandler<,>));
```

If the repository uses MediatR, write an `IPipelineBehavior<TRequest, TResponse>` instead; it is the same pattern with MediatR doing the wiring.

## Testing decorators

Test the core without decorators, each decorator against a hand-written fake inner service, and the composed chain once.

```csharp
sealed class FakeOrderService(PlaceOrderResult result) : IOrderService
{
    public Task<PlaceOrderResult> PlaceAsync(PlaceOrder command, CancellationToken cancellationToken) =>
        Task.FromResult(result);
}

[Fact]
public async Task Records_duration_tagged_with_outcome()
{
    using var services = new ServiceCollection().AddMetrics().AddSingleton<OrderMetrics>().BuildServiceProvider();
    var metrics = services.GetRequiredService<OrderMetrics>();
    using var collector = new MetricCollector<double>(metrics.PlaceDuration);
    var sut = new MeteredOrderService(new FakeOrderService(new PlaceOrderResult.Rejected("Out of stock")), metrics);

    await sut.PlaceAsync(SomeOrder, CancellationToken.None);

    var measurement = Assert.Single(collector.GetMeasurementSnapshot());
    Assert.Equal("rejected", measurement.Tags["outcome"]);
}

[Fact]
public async Task Logs_outcome_and_customer()
{
    var logger = new FakeLogger<IOrderService>();
    var sut = new LoggingOrderService(new FakeOrderService(new PlaceOrderResult.Placed(OrderId.New())), logger);

    await sut.PlaceAsync(SomeOrder, CancellationToken.None);

    var record = logger.Collector.LatestRecord;
    Assert.Equal(LogLevel.Information, record.Level);
    Assert.Equal("placed", record.GetStructuredStateValue("Outcome"));
}

[Fact]
public void Chain_is_logging_then_metrics_then_core()
{
    using var services = BuildAppServices();
    using var scope = services.CreateScope();

    Assert.IsType<LoggingOrderService>(scope.ServiceProvider.GetRequiredService<IOrderService>());
}
```

`FakeLogger` and `MetricCollector<T>` come from `Microsoft.Extensions.Diagnostics.Testing`. They capture real log records and real measurements, so the test asserts what an operator would see.
