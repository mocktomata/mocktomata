---
'@mocktomata/framework': major
---

Remove extra serialization of the metadata.
This extra serialization is not needed.

Masking on metadata will work correctly when this is removed.

It's a breaking change as the `SpecRecord` are incompatible.
