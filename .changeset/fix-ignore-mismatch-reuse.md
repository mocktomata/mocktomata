---
"@mocktomata/framework": patch
"mocktomata": patch
"@mocktomata/nodejs": patch
"@mocktomata/cli": patch
"@mocktomata/io-remote": patch
"@mocktomata/service": patch
---

Fix `ignoreMismatch()` so that a changed value matches on every use during simulation, not only the first. Before, the second use of the value of this run threw `ActionMismatch`. A different value still throws, and so does a value of this run that was not passed to `ignoreMismatch()`.
