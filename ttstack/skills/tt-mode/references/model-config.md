# ttstack model lookup

Values live in the User Rule titled `ttstack models`. It is already in this session (Customize → Rules, this Cursor account). Do not Read `~/.cursor/rules`. Do not look in the repo. There is no file to `@`.

Pass Task `model` as the value of the named role line (`feature`, `how-explorer`, `swarm-workers`, ...). A comma-separated line is a list: one subagent per entry, alias entries included.

Omit Task `model` when the rule is missing, the line is missing, or the value is `inherit-parent` or `auto`.

If a real slug is rejected as unresolvable, pick the closest valid slug in the same family (highest reasoning tier), spawn, and tell the user to re-run `/setup-ttstack`. Do not treat the aliases as broken slugs.
