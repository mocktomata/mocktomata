---
title: mockto
---

Now it's time to show you everything I can do.

I am one of the four mocktomata in the [mocktomata] family.

I specialize in writing tests.

Let me repeat the example from [introduction],
but with detail explanations:

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

mockto('get friends', (specName, spec) => {
  test(specName, async () => {
    const s = await spec(axios)

    const friends = await getFriends(s, 'miku')
    expect(friends.map(f => f.name)).toEqual(['luka', 'rumi', 'len', 'ren'])

    await spec.done()
  })
})
```

You can see that the key piece is the `spec` function.
In fact, while every mocktomaton do things a bit differently,
at our core we all provide a `spec` function to you.

The `Spec` is what we use to track "a set of behavior".
The only different is how do we provide it to you.

Since it is a standalone topic that shared among all mocktomata,
I will detail it in a different section.

Right now, let me first go through the details about myself.


We will get into the detail of `Spec` in a moment,

Before I get into the detail of the `Spec`,
let me first describe my API:

- [`mockto(specName, [options], (specName, spec, reporter) => void)`](#mocktospecname-options-specname-spec-reporter--void)
- [`mockto.live(specName, [options], (specName, spec, reporter) => void)`](#mocktolivespecname-options-specname-spec-reporter--void)
- [`mockto.save(specName, [options], (specName, spec, reporter) => void)`](#mocktosavespecname-options-specname-spec-reporter--void)
- [`mockto.simulate(specName, [options], (specName, spec, reporter) => void)`](#mocktosimulatespecname-options-specname-spec-reporter--void)
- [`mockto.teardown()`](#mocktoteardown)
- [Tips and Tricks](#tips-and-tricks)
  - [TDD Workflow](#tdd-workflow)
  - [Lazy TDD Workflow](#lazy-tdd-workflow)
  - [Streamlined Workflow](#streamlined-workflow)
  - [Update One Test Record](#update-one-test-record)
  - [Preserving Passed Tests](#preserving-passed-tests)
  - [Use Configuration To Update Record](#use-configuration-to-update-record)

## `mockto(specName, [options], (specName, spec, reporter) => void)`

This is the common way to utilize me.

It will run the `Spec` in `auto` mode.

What that means is that when when the code executes,
if there is no `SpecRecord` available,
the `Spec` will make the actual calls and record the behavior.
If `SpecRecord` available, the `Spec` will load the record and replay the behavior.

This behavior can be changed through [configuration].

The `specName` is the name of the `Spec` (duh).
It is passed into the `handler` so that you can use it as the test description.
This way, you don't have to repeat the same thing twice.

It is also used as the identifier of the `Spec` within one test file.
The `SpecRecord` will be named after the `specName`.
That means, if you use some grouping functions such as `describe()`,
you may accidentially two `Spec` with the same identifier,
so one of them will not work correctly.
I'll talk more about it when we get to the detail of `Spec`.

The `handler` is where I provide the `spec` function to you.
You can use it to write your test.

The `handler` also provides the `reporter` which is a `MemoryLogReporter` from [standard-log].
It captures the logs so that you can examine them programmatically.
It is part of the `Spec` so I will show you how to use it in that section.

The `options` is a `Spec.Options` that used to configure the `Spec`.
Again, I will talk more about it when we get to the detail of `Spec`.

## `mockto.live(specName, [options], (specName, spec, reporter) => void)`

Always run the spec in `live` mode.
Actual calls will be made, and the behavior is not recorded.
These specs are not affected by configuration.

## `mockto.save(specName, [options], (specName, spec, reporter) => void)`

Always run the spec in `save` mode regardless if a spec record exists or not.
These specs are not affected by configuration.

## `mockto.simulate(specName, [options], (specName, spec, reporter) => void)`

Always run the spec in `simulate` mode.
These specs are not affected by configuration.

## `mockto.teardown()`

Each mocktomata internally has a time tracker to make sure you have called `spec.done()` at the end of each test,
because that is a very common mistake.

But test runner like `jest` will emit a warning if there are open handles at the end of the test suite (for each file).
`mockto.teardown()` will clear those handles and emit necessary warnings.

```ts
afterAll(() => mockto.teardown())

mockto('some test', (specName, spec) => {
  test(specName, async () => { ... })
})
```

## alias as `mt`

Besides calling me as `mockto`, you can also call me as `mt`:

```ts
import { mt } from 'mocktomata'

mt(...)
```

[`komondor`][komondor] said that people think his name is too long to type so he wants to be alias as `kd`.
And as he does that, he also give me this `mt` alias.

Oh well.

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
[komondor]: ./komondor.md
[zucchini]: ./zucchini.md
[standard-log]: https://github.com/unional/standard-log
[configuration]: ./configuration.md
