---
'@mocktomata/framework': patch
'@mocktomata/io-remote': patch
'@mocktomata/nodejs': patch
'@mocktomata/service': patch
'mocktomata': patch
---

Pick up the republished upstream packages.

Runtime dependency ranges move to `standard-log@^13.0.1`, `standard-log-color@^13.0.1`
and `tersify@^4.0.6`. All three majors are build-target and packaging changes rather
than API changes — standard-log 13 is a tsdown rebuild plus a "drop ES5" target bump,
and tersify 4 targets ES2020 and publishes `.cjs`/`.mjs`. Every symbol this repo
imports is still exported, all three still ship a CommonJS entry point, and none of
them declares an `engines` floor. This is a patch: what ships is rebuilt, no public
API changes.
