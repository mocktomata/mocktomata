---
"@mocktomata/framework": patch
"@mocktomata/io-remote": patch
"mocktomata": patch
"@mocktomata/nodejs": patch
"@mocktomata/service": patch
---

Rename packages:

- `@mocktomata/file-server` -> `@mocktomata/service`
- `@mocktomata/io-client` -> `@mocktomata/io-remote`
- `@mocktomata/io-fs` -> `@mocktomata/nodejs`

Remove package:

- `@mocktomata/io-local`: moved inside `@mocktomata/nodejs`