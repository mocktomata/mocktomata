---
'mocktomata': patch
'@mocktomata/framework': patch
---

Fix relative path issue when running in `jsdom`.

In `jsdom`, the error path is absolute file path,
instead of path relative to the `location.origin`.

Need to try using `process.cwd()` when available to get the relative path.
