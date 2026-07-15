---
title: Gotchas
description: A short token invites a confident wrong reading — the confusions worth knowing first.
---

isnow is compact, and compactness invites a confident wrong reading. These are the ones worth knowing before they bite. When in doubt about what a pattern means, run `isnow canon <isnow>` to see its fully-qualified canonical form.

## The week starts Sunday

Weekday and interval numbering start at **Sunday = 1**, not Monday. So the interval `+[3d]` holds on **Sunday, Wednesday, Saturday** — not Mon/Thu/Sun. If you think in ISO weeks, adjust by one.

## Intervals re-align; they don't free-run

`+[25h]` is not a clean 25-hour clock ticking forever. It anchors to the week and re-aligns every Sunday, so one gap per week is shorter than 25 hours. Intervals stay glued to the civil calendar by design — that is what keeps `+[2h]` at local midnight, 02:00, 04:00 … instead of drifting. (A free-running lattice would need an absolute anchor, which the language does not yet carry.)

## `!12/25` and `! 12/25` are different

The separator is load-bearing:

- `!12/25` (no space) — a **field** exclusion: the 25th of any month _except_ December.
- `! 12/25` (set off by a separator) — a **pattern** exclusion: skip December 25 entirely.

## It's a membership test, not a generator with a count

isnow answers "does it hold now?" `next` and `prev` are _derived_ from that and are unbounded. There is no "run exactly 10 times": `COUNT` needs an anchor the language does not yet have. If you need a fixed, counted series, reach for iCalendar and gate it with isnow.

## Defaults fill by position, not by intent

A lone `6` is exactly `06:00:00`, not "6-ish." A bare numeric weekday is legal only in the explicit three-group form (`*/*/* 3 *:*:*`), and there `3` is a weekday (Sunday = 1), not "the 3rd of the month." The [shorthand ladder](../language/#canonical-form-and-the-shorthand-ladder) resolves every short form by separator position — `isnow canon` makes it explicit.
