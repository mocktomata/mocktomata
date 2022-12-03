---
"@mocktomata/framework": patch
---

Change `MissingAction` behavior.

Instead of throw and failing the simulation,
Missing action will now emit a log instead.
This is because it can occurs naturally due to serialization work.
