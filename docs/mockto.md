# `mockto`

This is the user manual for `mockto`.

It is specialized for writing tests.

For using [`mocktomata`][mocktomata] in production code,
please check out [`komondor`](./komondor.md).

The main benefit of using `mockto` is that the test `specName` are prepared for you.
So that you don't have to repeat that yourself.

Also, when you use it with a specific mode,
the `specName` will mention the `mode` so that it is easier to track in the test report.

If your test runner support nesting, for example the `describe()` function in `jasmine`, `mocha` or `jest`,
remember that the `specName` must be unique,
so you may need to repeat the `name` in `describe(name, handler)` in the `specName`.

- [`mockto`](#mockto)
  - [`mockto(specName, [options], (specName, spec) => void)`](#mocktospecname-options-specname-spec--void)
  - [`mockto.live(specName, [options], (specName, spec) => void)`](#mocktolivespecname-options-specname-spec--void)
  - [`mockto.save(specName, [options], (specName, spec) => void)`](#mocktosavespecname-options-specname-spec--void)
  - [`mockto.simulate(specName, [options], (specName, spec) => void)`](#mocktosimulatespecname-options-specname-spec--void)
  - [`mockto.teardown()`](#mocktoteardown)
  - [Tips and Tricks](#tips-and-tricks)
    - [TDD Workflow](#tdd-workflow)
    - [Lazy TDD Workflow](#lazy-tdd-workflow)
    - [Streamlined Workflow](#streamlined-workflow)
    - [Update One Test Record](#update-one-test-record)
    - [Preserving Passed Tests](#preserving-passed-tests)
    - [Use Configuration To Update Record](#use-configuration-to-update-record)

## `mockto(specName, [options], (specName, spec) => void)`

This is the basic usage of `mockto`.

When you call it the first time, it will make the actual calls and record the behavior.
When you call it again, it will load the record and replay the behavior.

Here is an example on how to use it:

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

mockto(
  // Name of the spec. Every test in the same test file must have a unique name.
  'get followers of a user',
  // Optional option.
  // You can omit the option like this: `mockto(specName, (specName, spec) => void)`
  {
    // how long the spec will wait before consider it as a failure.
    timeout: 3000
  },
  (specName, spec) => {
    test(specName, async () => {
      // `s` is a spec'd copy of `axios`.
      const s = await spec(axios)

      // getFollowers() is your code
      // use `s` in place of `axios`
      const followers = await getFollowers(s, 'danny')
      expect(followers.length).toBe(10)

      // indicates the spec is done.
      // note that it returns a Promise.
      // you have to await or return it.
      await spec.done()
    })
  }
)
```

The actual behavior of the call can be controlled by [`configuration`](./configuration.md).

For methods available to `spec`, please check out its [`user manual`](./spec.md).

## `mockto.live(specName, [options], (specName, spec) => void)`

Always run the spec in `live` mode.
Actual calls will be made, and the behavior is not recorded.
These specs are not affected by configuration.

## `mockto.save(specName, [options], (specName, spec) => void)`

Always run the spec in `save` mode regardless if a spec record exists or not.
These specs are not affected by configuration.

## `mockto.simulate(specName, [options], (specName, spec) => void)`

Always run the spec in `simulate` mode.
These specs are not affected by configuration.

## `mockto.teardown()`

`mockto` internally has a time tracker to make sure you have called `spec.done()` at the end of each test,
because that is a very common mistake.

But test runner like `jest` will emit a warning if there are open handles at the end of the test suite (for each file).
`mockto.teardown()` will clear those handles and emit necessary warnings.

```ts
afterAll(() => mockto.teardown())

mockto('some test', (specName, spec) => {
  test(specName, async () => { ... })
})
```

## Tips and Tricks

Here are some tips and tricks to help you become more productive when using `mockto`.

### TDD Workflow

If you are writing code TDD style,
use `mockto.live()` throughout your red-green-refactor process.
After you are done, change it to `mockto()` and run the test again.

### Lazy TDD Workflow

Instead of using `mockto.live()`, you can use `mockto.save()`.
This will save you from running the test again after updating to `mockto()`.

### Streamlined Workflow

Instead of using `mockto.live()` or `mockto.save()`,
you can use `mockto()` directly but do not add the last `await spec.done()` call until you are done refactoring.
When your get your test to pass, it will emit a warning letting you know you forgot to do `await spec.done()`.

### Update One Test Record

By changing `mockto()` to `mockto.save()`, run the test, and switch it back.

### Preserving Passed Tests

If the external dependency is not stable or no longer available (for the time being or require specific condition or permission),
you can consider changing some tests from `mockto()` to `mockto.simulate()` so that the test behavior is preserved.

When using `mockto.simulate()`, configuration will not change it behavior thus will not accidentally overwrite the record.
However, this should be done with care, because you are essentially changing the test to a simple mocked unit test.

### Use Configuration To Update Record

Refer to [`configuration tips and tricks`](./configuration.md#tips-and-tricks) session for ways to update multiple records.

[mocktomata]: https://github.com/mocktomata/mocktomata/blob/master/packages/mocktomata
