---
'@mocktomata/framework': patch
'@mocktomata/io-remote': patch
'@mocktomata/nodejs': patch
'@mocktomata/service': patch
'mocktomata': patch
---

Pick up the republished upstream packages.

Runtime dependency ranges move to `standard-log@^13.0.1` and `tersify@^4.0.6`. Both
majors are build-target and packaging changes rather than API changes — standard-log 13
is a tsdown rebuild whose only removals are unreferenced `dist/` bundles, and tersify 4
retargets ES2020 and renames its outputs to `.cjs`/`.mjs`. Every symbol this repo
imports is still exported, both still ship a CommonJS entry point, and neither declares
an `engines` floor. This is a patch: what ships is rebuilt, no public API changes.

`standard-log-color` deliberately stays on `^12.1.2`. Version 13.0.1 raises
`supports-color` to `^11.0.0`, which is ESM-only and requires Node >= 22, while
standard-log-color still publishes a CommonJS build that `require()`s it — so its CJS
consumers break in browser and Electron environments.
