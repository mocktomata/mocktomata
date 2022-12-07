---
"@mocktomata/framework": minor
---

Add `Zucchini.Fn` and `Spec.MaskValueFn` type.

Add `Spec.Options.ssf`.
This allows tests to create helper functions.

```ts
// some-helpers.ts
function someHelperFunction(..., options?: Spec.Options) {
  return komondor(..., { ...options, ssf: someHelperFunction })
}

// the-test.spec.ts
it('...', () => {
  const spec = someHelperFunction(...)
})
```
