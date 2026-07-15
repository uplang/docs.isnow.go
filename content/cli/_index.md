---
title: CLI reference
---

<!-- markdownlint-disable-file MD014 -- shell examples intentionally use a `$` prompt without echoing output -->

The `isnow` binary tests, derives, explains, schedules, and serves isnow patterns. Install with `go install github.com/uplang/isnow.go/cmd/isnow@latest`.

## Exit codes

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| `0`  | the isnow holds / the operation succeeded |
| `1`  | the isnow does not hold (test commands)   |
| `2`  | invalid isnow or arguments                |
| `3`  | runtime failure                           |

## The membership test (default command)

The binary _is_ the question — its exit code is the answer:

```console
$ isnow 'M,W,F noon' --at 2026-07-15T12:00:00Z ; echo $?
0
$ isnow 'M,W,F noon' --at 2026-07-15T12:00:01Z ; echo $?
1
```

`--at INSTANT` tests a specific instant (default now); `--tz ZONE` (or `ISNOW_TZ`) sets the evaluation zone; `--explain` prints the canonical form and verdict.

```console
$ backup.sh && isnow '/1 0' && echo "first of the month"
```

## Occurrences

```console
$ isnow next 6 --from 2026-07-14T07:00:00Z -n 2
2026-07-15T06:00:00Z
2026-07-16T06:00:00Z
$ isnow prev '11/ Th-[1] noon' --from 2026-12-01T00:00:00Z
2026-11-26T12:00:00Z
```

## canon and explain

```console
$ isnow canon '/1 18'
*/*/01 * 18:00:00
$ isnow explain 'M,W,F noon'
*/*/* Monday,Wednesday,Friday 12:00:00
holds at 12:00:00 on Monday,Wednesday,Friday
```

## wait — block until an occurrence

```console
$ isnow wait 6 && ./nightly-report      # runs at the next 06:00
$ isnow wait '::+[30]' --timeout 1m      # exit 3 if no occurrence within a minute
```

## run — the cron superset

Run a command at every occurrence:

```console
$ isnow run '*/*/* M-F 09:00' -- ./standup-reminder
```

Or drive a **nowtab** — lines of `<isnow>  <command>` (with `#` comments):

```text
# nowtab
/1 0            ./monthly-invoice
*/*/* F 17:00   ./weekly-backup
::+[9] >=6 <=18 ./poll-during-business-hours
```

```console
$ isnow run --tab ./nowtab
```

Commands run synchronously, so a single entry never overlaps itself.

## build — compose an isnow

```console
$ isnow build --weekday M,W,F --hour 12
*/*/* Monday,Wednesday,Friday 12:00:00
$ isnow build --hour 12 --since 2011 --until 2016
*/*/* * 12:00:00 >=2011/*/* * *:*:* <=2016/*/* * *:*:*
```

## serve — the HTTP time server

```console
$ isnow serve --addr :8601
```

See the [HTTP API reference](../http/).
