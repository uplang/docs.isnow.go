---
title: Language tour
---

Every isnow concept has one name. This page is the working vocabulary; the normative definitions live in [SPECIFICATION.md](https://github.com/tsvsheet/isnow/blob/main/SPECIFICATION.md).

## The membership test

An **isnow** _holds at_ an **instant** when every field constraint is satisfied. That test — `Holds(at)` — is the language's defining operation; "next occurrence" and "previous occurrence" are derived from it. An **occurrence** is any instant at which the isnow holds.

```go
p, _ := isnow.Parse("M,W,F noon")
p.Holds(time.Now())          // is it now?
p.Next(time.Now())           // the next occurrence
```

## The seven fields

An isnow is seven **fields** in three **groups**:

```text
Y/m/d   w   H:M:S      [ >|>= spec ]   [ <|<= spec ]
└ date group ┘ │ └ time group ┘
          bare group
```

| Field                | Group      | Separator |
| -------------------- | ---------- | --------- |
| year, month, day     | date group | `/`       |
| weekday              | bare group | —         |
| hour, minute, second | time group | `:`       |

**Groups** are separated by whitespace, `.`, or `_`, so an isnow is a single shell-safe token: `Y/m/d.w.H:M:S` ≡ `Y/m/d_w_H:M:S` ≡ `Y/m/d w H:M:S`.

## The field algebra

One uniform algebra applies to every field:

| Construct | Name | Example |
| --- | --- | --- |
| `*` | wildcard | `*` |
| `12` | exact value | hour 12 |
| `M,W,F` | set | Mon, Wed, Fri |
| `!1` | exclusion | not the 1st |
| `8-12` | span (inclusive, wraps on cyclic fields) | hours 8–12 |
| `-1` | from-end value | the last day of the month |
| `-2w1d` | unit compound | the last 2 weeks and 1 day |
| `+[15]` | step from an anchor | `:0+[15]` = every 15 minutes |
| `-[1]` | step from the end | `Th-[1]` = the last Thursday |
| `Monday+[3]` | weekday-occurrence step | the 3rd Monday of the month |
| `M-F-[1]` | weekday-span BYSETPOS | the last business day of the month |

**Symbols** are case-insensitive, minimal-unique names: weekdays `Su M Tu W Th F Sa` (plus runs `MWF`, `SS`, `TT`), and the times `noon`/`midday` (12:00:00) and `midnight` (00:00:00). `m` is always Monday.

## Intervals

An **interval** — `+[N<unit>]` with a duration unit `s`, `mn`, `h`, or `d` — is a true periodic recurrence ("every N units") written as a bare group of its own. Unlike a field step, which stays inside one field's cycle, an interval crosses field boundaries: `+[90mn]` spans hours, `+[25h]` spans days, `+[10d]` spans months.

An interval anchors **hierarchically to the civil calendar**: the stride picks the smallest civil container that holds it — `minute → hour → day → week → month → year` — and repeats within each container, re-aligning at its boundary. The anchor _moves with its unit_ rather than drifting from a fixed epoch, so intervals stay aligned to the wall clock and are DST-sane.

| Interval  | Container | Holds at                                         |
| --------- | --------- | ------------------------------------------------ |
| `+[90mn]` | day       | 00:00, 01:30, 03:00, … (re-aligns each midnight) |
| `+[2h]`   | day       | 00, 02, … 22                                     |
| `+[3d]`   | week      | Sunday, Wednesday, Saturday                      |
| `+[25h]`  | week      | Sun 00:00, Mon 01:00, … Sat 06:00                |
| `+[10d]`  | month     | the 1st, 11th, 21st, 31st                        |
| `+[40d]`  | year      | day-of-year 1, 41, 81, …                         |

The week container starts on **Sunday** (weekday 1). An interval ANDs with the rest of the pattern: `M-F +[30mn] >=9 <=17` is every 30 minutes on weekdays inside business hours.

## Pattern exclusions

A **pattern exclusion** — `! <spec>`, the `!` set off from its sub-spec by a separator — removes every instant where the sub-spec holds. Chain them for a holiday list:

```isnow
M-F ! 12/25 ! 1/1       every weekday except Christmas and New Year
```

The separator is load-bearing: `!12/25` (no space) is a _field_ exclusion (the 25th of any month except December), while `! 12/25` (set off by a separator) is a _pattern_ exclusion (skip December 25 entirely).

## Canonical form and the shorthand ladder

The **canonical form** is the fully-qualified `Y/m/d w H:M:S` expansion of any isnow. The **shorthand ladder** lets a short isnow stand for its canonical form by position:

| Shorthand  | Canonical                 |
| ---------- | ------------------------- |
| `6`        | `*/*/* * 06:00:00`        |
| `M noon`   | `*/*/* Monday 12:00:00`   |
| `/1 18`    | `*/*/01 * 18:00:00`       |
| `Su :0,30` | `*/*/* Sunday *:00,30:00` |

Produce it with `isnow canon <isnow>` or `Pattern.Canonical()`.

## Bounds

A **since bound** (`>`, `>=`) and an **until bound** (`<`, `<=`) each carry a sub-spec and define a **window**:

```isnow
12 <9/1                 every day at noon until September 1
::+[9] >=6 <=18         every 9 seconds from 06:00 to 18:00
```

> **v0.1.0 note:** steps are field-local in every context; a step counting continuously across a bounded window is a planned future extension. Bounds themselves are fully honored.
