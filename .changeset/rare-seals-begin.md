---
"@mocktomata/framework": minor
---

Add `Zucchini.Fn` and `Spec.MaskValueFn` type.

Add `Spec.Options.testRelativePath`.
This allows tests to create helper functions and specify where the test actually written.

Note that it must be a relative path. You can get it by:

- CommonJS: `path.relative(process.cwd(), __filename)`
- ESM: `path.relative(process.cwd(), filename(import.meta))` using (`dirname-filename-esm`)
