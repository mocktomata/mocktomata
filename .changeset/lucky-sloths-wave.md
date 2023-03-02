---
'@mocktomata/framework': patch
---

Replace `specRelativePath` with `specPath`.

`specRelativePath` is hard to produce as doing `path.relative(process.cwd(), __filename)` should be avoided.

Because that will fail if the test is loaded in `jsdom` or `happy-dom`.

Replace with `specPath` makes it easier if we can get a `filename(import.meta)` function that works in all cases.
