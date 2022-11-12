---
"@mocktomata/framework": patch
---

Changed `maskValue()` behavior.

It now only accept `string` or `RegExp`, and the `replaceWith` only accepts `string`.

It now masks logs and the resulting `SpecRecord` only.
The value will pass through the system intact when possible.

This is needed so that during `save` mode the sensitive information can be passed correctly to the spec subject.

This means in certain cases the `save` mode and `simulate` mode will pass the original sensitive value or the masked value around.
During test, you should not assert the sensitive value directly.

You can however assert the record does not contain the sensitive information by setting `logLevel` to `logLevels.all`,
and inspect the log message.

The log message under `logLevels.all` will contain the spec record.

For example:

```ts
import { logLevels } from 'standard-log'
import { mt } from 'mocktomata'
mt('...', (specName, spec, reporter) => {
  it(specName, async () => {
    // ...
    await spec.done()
    expect(reporter.getLogMessage()).not.toContain('sensitive')
  })
})
```
