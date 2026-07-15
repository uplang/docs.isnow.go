---
title: isnow in a QR code
description: A schedule small enough to print — scan it and decide "active now?" offline.
---

Because an isnow is one short token _and_ a self-contained membership test, a device that scans it can answer **"is this active now?"** from its own clock — offline, no server, no series to expand. That makes a QR code a natural carrier for a schedule.

## Every realistic isnow fits a tiny code

QR codes come in _versions_ — lower is smaller and easier to scan. isnow's one-token compactness keeps codes at the very low end:

![QR code for the isnow M-F 09:00](simple.png)

`M-F 09:00` — 9 bytes, **Version 1** (21×21 modules), the smallest QR code that exists.

![QR code for the isnow M-F +[30mn] >=9 <=17](rich.png)

`M-F +[30mn] >=9 <=17` — every 30 minutes inside business hours; 20 bytes, **Version 2** (25×25).

![QR code for the isnow M-F-[1] noon ! 12/25 ! 1/1](advanced.png)

`M-F-[1] noon ! 12/25 ! 1/1` — the last business day at noon, minus holidays; 26 bytes, **Version 2** (25×25).

For comparison, the equivalent iCalendar RRULE for the middle schedule — `FREQ=MINUTELY;INTERVAL=30;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9,10,…,17` — is 79 bytes and needs a **Version 5** (37×37) code: over twice the module area for the same schedule. Uppercased, isnow's core algebra (`* / : + - ,`, space, names, digits) even fits QR's densest _alphanumeric_ mode; only `[ ] < > = !` from the interval, bound, and exclusion extensions force byte mode.

## What it's good for

- **Offline membership at the edge.** A restriction sign, a ticket ("valid `M-F 09-17`"), an appliance panel, an NFC-tagged door — scan and the device decides, now, with no lookup.
- **Config handoff.** Move a maintenance window or a flag schedule between systems as a scannable value instead of a form.
- **Constrained channels.** Anywhere the payload budget is a few dozen bytes and the reader has a clock.

A QR-encoded isnow carries a _recurring policy_ — "every weekday, 9 to 5" — not a pinned, counted event. For a bounded, counted series, pair it with a calendar.
