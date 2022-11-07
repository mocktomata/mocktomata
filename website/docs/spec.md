# spec

This is the user manual for `spec`.

You will get a `spec` object when using [`mockto`](./mockto.md), [`komondor`](./komondor.md) and [`incubator`](./incubator.md).

It is the main mechanism to record the behaviors.

- [spec](#spec)
  - [`spec<S>(subject: S): Promise<S>`](#specssubject-s-promises)
  - [`spec.done(): Promise<void>`](#specdone-promisevoid)
  - [`spec.ignoreMismatch(value)`](#specignoremismatchvalue)
  - [`spec.maskValue(value, [replaceWith])`](#specmaskvaluevalue-replacewith)

## `spec<S>(subject: S): Promise<S>`

This tell the `spec` to create a `test double` of the `subject`.
The `test double` should be used in place of the `subject`.
It will record or replay the behavior depends on which `mode` the `spec` is in.

You can use `spec` to create test doubles for multiple subjects.
This is useful when using `mocktomata` in production code.
It should work as is (but not tested at the moment. So if you encounter any issue, please file an issue [here](https://github.com/mocktomata/mocktomata/issues)).

## `spec.done(): Promise<void>`

Tell the `spec` that you are done.
The `spec` will then stop the system and record the behavior as needed.

## `spec.ignoreMismatch(value)`

Sometimes the input you provide to the test may not be static.
For example, random number, date time, or hostnames.

In 7.0, reference values (string, object, array, function) are not validate for changes,
i.e. even if you pass in a different string, the system will not fail it with `ActionMismatch` error.
This is because we track the behavior, not and exact call, whenever possible.

This is a new concept and is subject to change if it does not work well.

On the other hand, primitive values such as number and boolean are validated.

If you want to tell `spec` that it should not care about the changes,
you can use `spec.ignoreMismatch()`.

## `spec.maskValue(value, [replaceWith])`

If the behavior of your code sends or receives sensitive information,
you should use `spec.maskValue()` to indicate those values should be masked in the record.

This prevents those sensitive information to be saved and commited to your source control.

the sensitive information can be `string` or `number`.
If it is `string`, you can use `string` or `RegExp` to identify the `value`.

While you can call `spec.maskValue()` anytime before the sensitive information appear,
for best practice you do declare them at the beginning of your code.

```ts
test('...', async () => {
  const spec = kd('...')
  spec.maskValue(...)
  spec.maskValue(...)
  const s = await spec(subject)
  ...
})
```

Here is the exact behavior when using `spec.maskValue()`:

If you are masking a `string` (using `string` or `RegExp`),
If you do not provide `replaceWith`,
the senstive information will be replaced with a string with the same length but filled with `*`. i.e.:

```ts
spec.maskValue('sensitive') // replace with '*********'
```

If keeping the same length is a concern, you should provide your own `replaceWith`.

If you are masking a `number`,
it will be rounded to a whole number, and replace all digits with `7`.

The `replaceWith` can be `string` or `number`,
or a callback receiving the sensitive data so that you can create your own mask.

i.e., the signature of `spec.maskValue()` is:

```ts
function maskValue(value: string | RegExp, replaceWith: string | ((sensitive: string) => string)): void
function maskValue(value: number, replaceWith: number | ((sensitive: number) => number)): void
```

The masked value will be returned, unless you are running in `live` mode explicitly:

```ts
test('secret is revealed in explicit live mode', async () => {
  const spec = await kd.live('...')
  spec.maskValue('secret')
  const s = spec(() => 'secret')
  expect(s()).toBe('secret')
})

test('sensitive', async () => {
  const spec = await kd('...')
  spec.maskValue('secret')
  const s = spec(() => 'secret')
  expect(s()).toBe('******') // even if you configure to run the test in live mode
})
```

The sensitive information is return during `kd.live()` so that you can observe the actual result.
