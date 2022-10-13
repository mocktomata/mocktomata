---
"@mocktomata/framework": minor
---

Add `incubator.teardown()`
You normally don't need to do this.
But if there is a bug that cause NodeJS to complain about some event leak,
this function can be used to clean up.

Use it during `afterAll()`:

```ts
afterall(() => incubator.teardown())
```

Update `standard-log`.
Update `async-fp`
Update `type-plus`

Add spec based logger.
Now each spec will have its own logger,
making it easier to figure out which spec the log comes from.

The handlers get a `reporter` which you can inspect the logs within the test.
