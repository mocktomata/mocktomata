---
'mocktomata': patch
---

Add browser spec.
When it is accidentially picked up by bundler,
it should pickup the browser version to avoid getting nodejs code into it,
causing build problems.

The browser version is not yet working.
This is a stop gap solution.
