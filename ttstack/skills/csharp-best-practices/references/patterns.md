# C# patterns

Code examples for the Types and Services rules in `SKILL.md`. Decorators, logging, and metrics are in `decorators.md`. The underlying principles are language-agnostic; see the **type-system-discipline** and **boundary-discipline** principle skills.

## Project settings

Turn the compiler into the checker. Put these in `Directory.Build.props` so every project gets them.

```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
  <WarningsAsErrors>nullable;CS8509</WarningsAsErrors>
  <NoWarn>$(NoWarn);CS8524;CA1848</NoWarn>
  <AnalysisLevel>latest-recommended</AnalysisLevel>
</PropertyGroup>
```

`CS8509` fires when a switch expression misses a named case. `CS8524` fires for unnamed enum values such as `(Status)42`; suppressing it lets you omit the `_` arm, so adding an enum member breaks the build. An unnamed value still throws `SwitchExpressionException` at runtime.

`latest-recommended` turns on CA1848, which flags every `logger.LogX(...)` call and asks for `[LoggerMessage]` source generation instead. Plain structured calls are the convention here, so it is suppressed. CA2254 stays on and catches interpolated or concatenated templates.

## No `!`

```csharp
// Don't. Compiles, crashes when the lookup misses.
var user = users.Find(id)!;
SendWelcome(user.Email);

// Do. Make the miss a case the caller handles.
if (users.Find(id) is not { } user)
{
    return WelcomeResult.UnknownUser;
}
SendWelcome(user.Email);
```

When you remove a `!`, ask why the compiler can't prove non-null:

- The value is optional in the domain: keep `T?` and handle the null case.
- The value is never null but the type says `T?`: fix the declaration at its source.
- The value comes from outside: parse at the boundary into a non-nullable type.
- The value is set by a framework after construction: use `required` or constructor injection.

## Closed hierarchies

Model variants as an abstract record with a private constructor. Only the nested cases can derive from it, so no one outside can add a variant.

```csharp
// Don't. Contradictory states compile.
public sealed class DiffState
{
    public bool IsLoading { get; init; }
    public GitDiff? Diff { get; init; }
    public string? Error { get; init; }
}

// Do. Only valid states exist.
public abstract record DiffState
{
    private DiffState() { }

    public sealed record Loading : DiffState;
    public sealed record Ready(GitDiff Diff) : DiffState;
    public sealed record Failed(string Error) : DiffState;
}
```

If the repository's language version has native union types, use them instead.

## Exhaustiveness

Enums: no `_` arm, so `CS8509` breaks the build when a member is added.

```csharp
public enum Severity { Info, Warning, Error }

static ConsoleColor ColorOf(Severity severity) => severity switch
{
    Severity.Info => ConsoleColor.Gray,
    Severity.Warning => ConsoleColor.Yellow,
    Severity.Error => ConsoleColor.Red,
};
```

Records: the compiler doesn't know the hierarchy is closed, so a switch expression over it needs a `_` arm, and a new case compiles silently.

```csharp
// Compiles, but a new case reaches the throw at runtime.
string Render(DiffState state) => state switch
{
    DiffState.Loading => "Loading",
    DiffState.Ready ready => Format(ready.Diff),
    DiffState.Failed failed => failed.Error,
    _ => throw new UnreachableException(),
};
```

When the answer belongs to the variant, put an abstract member on the base. A new case that doesn't override it doesn't compile.

```csharp
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
```

When the answer belongs to the caller, add a `Match` method with one function per case, or use the repository's exhaustiveness analyzer. Adding a case adds a parameter, which breaks every caller.

```csharp
public abstract TResult Match<TResult>(
    Func<Loading, TResult> loading,
    Func<Ready, TResult> ready,
    Func<Failed, TResult> failed);
```

## Strongly typed ids

`OrderId` and `CustomerId` are both `Guid` underneath and should not be interchangeable.

```csharp
public readonly record struct OrderId
{
    private OrderId(Guid value) => Value = value;

    public Guid Value { get; }

    public static OrderId New() => new(Guid.NewGuid());

    public static bool TryParse(string? input, out OrderId id)
    {
        if (Guid.TryParse(input, out var value) && value != Guid.Empty)
        {
            id = new OrderId(value);
            return true;
        }
        id = default;
        return false;
    }

    public override string ToString() => Value.ToString();
}
```

Don't use a positional `record struct OrderId(Guid Value)`: its public constructor skips validation. `default(OrderId)` still bypasses the constructor. If an empty id must be impossible rather than merely rejected at the boundary, use a `sealed record` class instead.

## Constructive modeling

Non-empty, as a head plus the rest:

```csharp
public sealed record NonEmpty<T>(T Head, IReadOnlyList<T> Tail)
{
    public IEnumerable<T> All => Tail.Prepend(Head);
}

public static class NonEmpty
{
    public static NonEmpty<T>? From<T>(IReadOnlyList<T> items) =>
        items.Count == 0 ? null : new(items[0], items.Skip(1).ToList());
}

// Don't: every caller must remember the check
static Session Newest(IReadOnlyList<Session> sessions) => sessions[0];

// Do: an empty value of the type can't exist
static Session Newest(NonEmpty<Session> sessions) => sessions.Head;
```

A time range, as start plus duration:

```csharp
// Don't: a comment holds the invariant
public readonly record struct TimeRange(DateTimeOffset Start, DateTimeOffset End); // Start <= End

// Do: one check in the one constructor; End is derived
public readonly record struct TimeRange
{
    public TimeRange(DateTimeOffset start, TimeSpan duration)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(duration, TimeSpan.Zero);
        Start = start;
        Duration = duration;
    }

    public DateTimeOffset Start { get; }
    public TimeSpan Duration { get; }
    public DateTimeOffset End => Start + Duration;
}
```

`TimeSpan` can be negative, so this shape still needs one guard. It lives in the constructor instead of at every use.

## Simplest total type

Keep the plain type when every operation is total:

```csharp
static decimal Total(IReadOnlyList<decimal> amounts) => amounts.Sum(); // empty is 0, fine
```

Strengthen when the loose type forces a lie at a use site. The tells are `!`, `.First()` or `[0]` with no check, and `throw new InvalidOperationException("should never happen")`. Returning `T?` is the other total signature.

## No casts

```csharp
// Don't
var order = (Order)message.Payload;
var name = (payload as Customer)!.Name;
dynamic json = JsonConvert.DeserializeObject(body);

// Do
if (message.Payload is not Order order)
{
    return HandleResult.Ignored;
}
```

## Narrowing hierarchy

From best to last-resort:

1. **Switch expression on a closed type or enum.** Compiler checks the cases.
2. **Property pattern.** `if (state is DiffState.Ready { Diff.Files.Count: > 0 } ready)`.
3. **Type pattern.** `if (x is Order order)`.
4. **Try method.** When the check needs logic beyond a pattern.
5. **Cast.** Only after validation.

## Try pattern

A `TryX` method with `[NotNullWhen(true)]` teaches the compiler what a `true` result proves. It must actually prove it.

```csharp
static bool TryGetDiff(DiffState state, [NotNullWhen(true)] out GitDiff? diff)
{
    diff = (state as DiffState.Ready)?.Diff;
    return diff is not null;
}

if (TryGetDiff(state, out var diff))
{
    Render(diff); // diff is GitDiff, not GitDiff?
}
```

Prefer a pattern when one fits.

## Boundary validation

Deserialize into a DTO, map once into domain types, and trust them inside. Make System.Text.Json enforce the contract the DTO declares.

```csharp
internal sealed record PlaceOrderRequest(string CustomerId, IReadOnlyList<OrderLineRequest> Lines);

static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
{
    RespectNullableAnnotations = true,
    RespectRequiredConstructorParameters = true,
};

static PlaceOrder ToCommand(PlaceOrderRequest request)
{
    if (!CustomerId.TryParse(request.CustomerId, out var customerId))
    {
        throw new ValidationException($"Invalid customer id: {request.CustomerId}");
    }
    var lines = NonEmpty.From(request.Lines.Select(ToOrderLine).ToList())
        ?? throw new ValidationException("An order needs at least one line.");
    return new PlaceOrder(customerId, lines);
}
```

- **Wire formats:** System.Text.Json ignores unknown members by default. Keep that on wire contracts so a newer sender doesn't break an older receiver.
- **Persisted JSON:** a versioned DTO with the deserialize in a `try`/`catch (JsonException)`.
- **EF entities and generated DTOs** stay in the infrastructure layer. Map them at the edge.
- **Don't re-validate** deep in call chains. Guard clauses inside the domain are for invariants the type can't express, not for re-checking parsed input.

## Schemas before guards

Before hand-writing field checks, use what the repository already trusts:

- **Request bodies:** the DTO plus `RespectNullableAnnotations`, then FluentValidation or DataAnnotations for rules the type can't hold.
- **Configuration:** options classes with `ValidateDataAnnotations().ValidateOnStart()`.
- **External APIs:** generated clients from the OpenAPI or `.proto` file (Kiota, NSwag, `Grpc.Tools`), not hand-written copies of their shapes.

Do not add a validation library for one check.

## Immutable by default

```csharp
public sealed record Customer
{
    public required CustomerId Id { get; init; }
    public required string Name { get; init; }
    public IReadOnlyList<Address> Addresses { get; init; } = [];
}

var renamed = customer with { Name = "Ada" };
```

Record equality compares collection properties by reference. Don't rely on `==` for records that hold lists.

## Named arguments

```csharp
// Don't. Swap two args, still compiles.
var order = PlaceOrder(customerId, 10, 3, true);

// Do. The call site says what each value means.
var order = PlaceOrder(customerId, quantity: 10, maxBackorderDays: 3, delivery: Delivery.Express);
```

## Constructor injection and lifetimes

```csharp
// Don't. Hidden dependencies, untestable time.
public sealed class InvoiceService(IServiceProvider services)
{
    public Invoice Create(Order order)
    {
        var repo = services.GetRequiredService<IInvoiceRepository>();
        return new Invoice(order.Id, DateTime.UtcNow);
    }
}

// Do. Every dependency is visible and replaceable.
public sealed class InvoiceService(IInvoiceRepository invoices, TimeProvider time) : IInvoiceService
{
    public Task<Invoice> CreateAsync(Order order, CancellationToken cancellationToken) =>
        invoices.AddAsync(new Invoice(order.Id, time.GetUtcNow()), cancellationToken);
}
```

```csharp
builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;
    options.ValidateOnBuild = true;
});
builder.Services.AddSingleton(TimeProvider.System);
```

## Validated options

```csharp
public sealed class PaymentOptions
{
    [Required, Url]
    public required string Endpoint { get; init; }

    [Range(1, 30)]
    public int TimeoutSeconds { get; init; } = 10;
}

builder.Services.AddOptions<PaymentOptions>()
    .Bind(builder.Configuration.GetSection("Payments"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

A bad config fails at startup, not on the first payment.

## Async all the way

```csharp
// Don't
public Order Get(OrderId id) => repository.GetAsync(id).Result;
async void OnTimer() => await SyncAsync();

// Do
public Task<Order?> GetAsync(OrderId id, CancellationToken cancellationToken) =>
    repository.GetAsync(id, cancellationToken);
```

Use `ValueTask` only where a profile shows `Task` allocation matters. Follow the repository's `ConfigureAwait` convention.

## Real tests

```csharp
public sealed class OrdersApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Placing_an_order_returns_its_id()
    {
        var time = new FakeTimeProvider(DateTimeOffset.Parse("2026-01-01T00:00:00Z"));
        var client = factory
            .WithWebHostBuilder(b => b.ConfigureServices(s => s.AddSingleton<TimeProvider>(time)))
            .CreateClient();

        var response = await client.PostAsJsonAsync("/orders", new { customerId = KnownCustomer, lines = OneLine });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
```

Run the real pipeline, the real container registrations, and a real database where the repository has test containers. Replace only time, randomness, and services you can't run locally.
