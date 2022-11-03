---
"@mocktomata/framework": patch
"@mocktomata/io-remote": patch
"mocktomata": patch
"@mocktomata/nodejs": patch
"@mocktomata/service": patch
---

Distribute CJS.
There are dependencies still on in ESM,
so forcing ESM only means tools like `jest` need to go through a lot to get things working.
