---
title: Use cases
description: The jobs isnow is built for — anywhere a system asks "is this window open now?"
---

isnow fits wherever a system stands at an instant and asks **"is this window open now?"** — rather than enumerating a future series. That question is the tell: if your code evaluates a schedule at the current moment, isnow is the value it evaluates.

## Feature flags & entitlements

A flag check *is* a membership test. Store the isnow as the flag's value and evaluate it at request time.

```
M-F 09-17               on during business hours
F-Su                    on over the weekend (Fri–Sun)
M-F ! 12/25 ! 1/1       on every weekday except the holidays
```

## Maintenance & degradation windows

Let the service ask the pattern on each request — no scheduler, no cron daemon to run.

```
::+[1] >=2 <4           shed load nightly, 02:00–04:00
Su 03:00                weekly maintenance, Sunday 3am
```

## Alerting quiet-hours

Gate the pager; route everything outside the window to a digest.

```
M-F 08-20               page only during staffed hours
```

## Time-boxed access control

Enforce at the door or the token check, offline.

```
Sa,Su                   badge works weekends only
M-F 06-18 ! 12/25       contractor token: weekdays, minus the holiday
```

## Pricing & surge

One rule covers the calendar; exclusions carve out the exceptions.

```
F-Su 17-23              peak pricing, weekend evenings
```

## Scheduled jobs (the cron superset)

Everything cron does, plus bounds, from-end, intervals, and holiday lists. See [Migrating from cron](../cron/).

```
6                       daily at 06:00
M-F-[1] noon            the last business day of the month, at noon
```

Every recipe here is a single token — [put it in a QR code](../qr/) and the check goes offline.

## When to reach for something else

isnow answers "now?"; it does not *own* an event series. If the source of truth is a set of discrete, editable occurrences — a shared calendar, a booking, an invitation, or "the 10th session" — use iCalendar and let isnow *gate* it rather than describe it. See [Gotchas](../gotchas/) for the boundary in detail.
