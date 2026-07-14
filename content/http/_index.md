---
title: HTTP API reference
---

`isnow serve` exposes the language over HTTP, versioned under `/v1`. Opening the server root (`/`) in a browser serves an **interactive playground** — a live evaluator that breaks a pattern into its labeled fields, explains it, shows the next occurrences, and a builder — all driven by the API below. An isnow appears as a catch-all path suffix (its internal `/` separators need no encoding) or as the `q` query parameter. Common query parameters: `at`/`from` (RFC 3339 instant, default now) and `n` (count). Every response carries `Cache-Control: no-store`. The default listen address is `:8601` (ISO 8601).

## The status-code membership test

`GET /v1/is/{isnow…}` makes `curl` a scheduler predicate: **204** if the isnow holds at `at`, **412 Precondition Failed** if not.

```console
$ curl -s -o /dev/null -w '%{http_code}\n' 'localhost:8601/v1/is/6?at=2026-01-01T06:00:00Z'
204
$ curl -s -o /dev/null -w '%{http_code}\n' 'localhost:8601/v1/is/6?at=2026-01-01T07:00:00Z'
412
```

## Endpoints

| Endpoint | Behavior |
| --- | --- |
| `GET /v1/is/{isnow…}` | **204** holds / **412** does not. No body. |
| `GET /v1/check/{isnow…}` | **200** `{"isnow", "canonical", "at", "holds"}`. |
| `GET /v1/next/{isnow…}?n=1&from=` | **200** `{"isnow", "canonical", "occurrences": […]}` — strictly after `from` (`n` ≤ 1000). |
| `GET /v1/prev/{isnow…}?n=1&from=` | Mirror of `next`, strictly before `from`. |
| `GET /v1/canon/{isnow…}` | **200** `{"isnow", "canonical"}`. |
| `GET /v1/explain/{isnow…}` | **200** `{"isnow", "canonical", "explanation"}`. |
| `GET /v1/build?year=&month=&day=&weekday=&hour=&minute=&second=&since=&until=` | Compose an isnow from field-algebra text. **200** `{"isnow", "canonical", "explanation"}`. |
| `GET /v1/wait/{isnow…}?timeout=60s` | Long-poll: **204** at the next occurrence, **504** if `timeout` (max 10m) elapses first. |
| `GET /v1/watch/{isnow…}` | Server-Sent Events: an `occurrence` event (data = RFC 3339) at each occurrence. |
| `GET /healthz` | **200** `{"status": "ok", "now": …}`. |

## Examples

```console
$ curl -s 'localhost:8601/v1/check/M,W,F%20noon?at=2026-07-15T12:00:00Z'
{"isnow":"M,W,F noon","canonical":"*/*/* Monday,Wednesday,Friday 12:00:00","at":"2026-07-15T12:00:00Z","holds":true}

$ curl -s 'localhost:8601/v1/next/6?from=2026-07-14T07:00:00Z&n=2'
{"isnow":"6","canonical":"*/*/* * 06:00:00","occurrences":["2026-07-15T06:00:00Z","2026-07-16T06:00:00Z"]}

$ curl -N 'localhost:8601/v1/watch/::+[9]'
event: occurrence
data: 2026-07-14T06:00:00Z
```

## Errors

An invalid isnow or parameter returns **400** with `{"error": {"code", "message"}}`, where `code` is a language error code (`syntax`, `symbol`, `range`, `context`) or `parameter`. Unknown routes return **404** with the same shape.
