---
'@mocktomata/framework': patch
'@mocktomata/io-remote': patch
'@mocktomata/nodejs': patch
'@mocktomata/service': patch
'mocktomata': patch
---

Raise the `standard-log` floor to `^13.1.0`.

`standard-log@13.1.0` is the first 13.x on `type-plus@8.0.0-beta.10`; `13.0.1` still pulled
`type-plus@7.6.2`. Raising the floor removes one of the duplicate `type-plus` majors from the
installed tree. Range-compatible for consumers — `^13.0.1` already admitted `13.1.0`.
