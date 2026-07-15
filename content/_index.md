---
title: isnow.go
---

**isnow** is a date/time *pattern* language — formally *DTimpalr, a Date/Time Pattern Language for Repetition*. An **isnow** (the language, and a pattern string in it) describes anything from a fixed instant to a complex recurrence and answers one question: **is it now?**

`isnow.go` is the Go implementation: an importable library, the `isnow` command-line tool, and an HTTP time server. It is a strict superset of cron in expressiveness — sets, spans, exclusions, from-end counting, steps, and since/until bounds, over one uniform per-field algebra.

```isnow
6                       every day at 06:00
M,W,F noon              Mon/Wed/Fri at 12:00:00
11/ Th-[1] noon         the last Thursday of November at noon
M-F +[30mn] >=9 <=17    every 30 min on weekdays, 9-to-5
M-F ! 12/25 ! 1/1       every weekday except the holidays
```

#### Learn the language

- **[Language tour](language/)** — the seven fields, the uniform algebra, intervals, exclusions, and the shorthand ladder.
- **[Use cases](uses/)** — the jobs isnow is built for, with a recipe for each.
- **[Gotchas](gotchas/)** — the confusions a compact token invites, and how to read past them.

#### Use the tool

- **[CLI reference](cli/)** — every `isnow` command with runnable examples.
- **[HTTP API reference](http/)** — the endpoints `isnow serve` exposes.
- **[Migrating from cron](cron/)** — your crontab, as isnows, and how isnow sits next to other schedulers.
- **[isnow in a QR code](qr/)** — a schedule small enough to print and scan offline.

The language itself (grammar, specification, and the conformance corpus every implementation passes) lives in [uplang/isnow](https://github.com/uplang/isnow). The library is `github.com/uplang/isnow.go`.
