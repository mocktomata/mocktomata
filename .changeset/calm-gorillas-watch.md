---
"@mocktomata/framework": patch
---

Fix issue when calling `array.sort()`.

`array.sort()` sorts value in-place, modifying the subject.
The set calls need to simulated by the plugin.

Update `tersify` to 3.11.1,
which supports computed property.

Computed property is used in `fetch`,
causing test timeout (throw internally) when logging.
