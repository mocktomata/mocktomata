---
"@mocktomata/framework": patch
---

reduce `maskValue()` overloads.

The others are not as useful and can cause confusion.

Also, trimming down the overloads before fixing masking for `SpecRecord`,
to make the fix easier to do.
