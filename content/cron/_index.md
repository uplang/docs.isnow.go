---
title: Migrating from cron
---

isnow is a strict superset of cron's expressiveness. A cron line's five fields — minute, hour, day-of-month, month, day-of-week — map onto an isnow's `Y/m/d w H:M:S`, and everything cron can say, an isnow can say (plus much it cannot). The key difference: an isnow is a **matcher**, so it also answers "is it now?", derives occurrences, and carries start/end bounds.

## Field mapping

| cron | isnow |
| --- | --- |
| `M H D Mo W` | `*/Mo/D W H:M:00` |
| minute `*/15` | `:0+[15]` |
| hour `8-17` | `8-17` |
| day-of-month `1` | `/1` |
| day-of-week `1-5` (Mon–Fri) | `M-F` |
| `L` (last day, extensions) | `-1` (from-end value) |
| `#3` (3rd weekday, extensions) | `+[3]` (step) |

## Worked examples

| crontab | isnow |
| --- | --- |
| `0 6 * * *` | `6` |
| `0 12 * * 1,3,5` | `M,W,F noon` |
| `*/15 * * * *` | `:0+[15]` |
| `0 9 * * 1-5` | `M-F 09:00` |
| `0 0 1 * *` | `/1 0` |
| `0 12 * 11 4#4` (4th Thu of Nov) | `11/ Th+[4] noon` |
| `0 0 L * *` (last day of month) | `*/*/-1 midnight` |

## What isnow adds

- **The membership test.** `isnow '/1 0'` exits 0 iff it is midnight on the 1st — compose it into any shell pipeline (`isnow wait 6 && backup`).
- **From-end counting.** `11/ Th-[1] noon` is the *last* Thursday of November — cron needs extensions and still can't express "the last 15 days" (`12/-15`).
- **Bounds.** `12 >=2011 <2016` runs only within a window; cron runs forever.
- **Seconds and steps everywhere.** `::+[9]` fires every 9 seconds; the same `+[N]` step works on any field.
- **One expression, many operations.** The same isnow answers `is`, `next`, `prev`, `explain`, `wait`, `run`, and serves over HTTP.

Drive a crontab-style schedule with a [nowtab](../cli/#run-the-cron-superset): `isnow run --tab ./nowtab`.

## Next to other schedulers

isnow covers the common ground of the whole scheduler family in one token, and adds the membership test none of them have:

| You want | Quartz cron | systemd `OnCalendar` | iCal RRULE | isnow |
| --- | --- | --- | --- | --- |
| last business day of the month | `L` + rules | — | `BYSETPOS=-1` | `M-F-[1]` |
| every 30 min, business hours | several entries | verbose | `FREQ=MINUTELY;INTERVAL=30;BYHOUR=…` | `M-F +[30mn] >=9 <=17` |
| skip holidays | — | — | `EXDATE` list | `! 12/25 ! 1/1` |
| "is it active *now*?" | — | — | — | the whole point |

What isnow deliberately does *not* do is own a bounded, counted event series (`COUNT`, `DTSTART`) — that stays iCalendar's job. See [Use cases](../uses/) for where each side fits.
