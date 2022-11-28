---
"@mocktomata/framework": patch
---

Fix zucchini using steps.

When specing the same subject, the same reference will be used.

Change `metarize` to use `@ungap/structured-clone` instead of `JSON`.
This will provide better support of objects with circular references.
