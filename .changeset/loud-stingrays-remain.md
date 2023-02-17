---
'@mocktomata/framework': patch
---

Do not throw `DuplicateStep` if the handler are identical.

`vitest` (and may be `jest` too) can load the ESM module file twice,
in two different worker which share scope.
Resulting the `defineStep()` is called twice with different handler reference.
