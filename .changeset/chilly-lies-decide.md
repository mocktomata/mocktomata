---
'@mocktomata/framework': patch
---

Allow `maskValue()` to be called after `spec()`.

This is needed for `zucchini` step definitions.
Instead a warning will be generated.

Fixes [#530](https://github.com/mocktomata/mocktomata/issues/530)

