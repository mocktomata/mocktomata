---
'@mocktomata/framework': major
---

Update `metarize()` to capture less info.
There is need to metarize deep props as those are handled by another instance.

This simplify the record and the spec record is more readable.
No need to use `@ungap/structured-clone` anymore.
