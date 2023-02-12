---
'@mocktomata/framework': patch
---

Fix `classPlugin` to not calling subject's constructure during simulation.
This enable support of the `ws` package,
as `ws.WebSocket` will create the connection in the constructor.

Exports the build-in plugins for building custom plugins.
