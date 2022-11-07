Hi, This is `komondor`.

<!-- markdownlint-disable-next-line -->
I used to be a guard dog. <img src="/mocktomata/img/komondor.jpg" alt="komondor" width="20"/>

But nowadays, I'm one of the four automata in the [mocktomata] family.

I also have an alias `kd` if you think my name is too long.

While [`mockto`] is specialized for testing,
I'm more general purposed and versatile.

Here is how to write the same test from [introduction]:

```ts
import axios from 'axios'
import { komondor } from 'mocktomata'

test('get friends', async () => {
  const spec = komondor('get friends')
  const s = await spec(axios)

  const friends = await getFriends(s, 'miku')
  expect(friends.map(f => f.name)).toEqual(['luka', 'rumi', 'len', 'ren'])

  await spec.done()
})

afterAll(() => komondor.teardown())
```

So you can see [`mockto`] and me are pretty similar.
The only different is that you call me within the test,
and you have to repeat the `specName` (if it is the same as your test description,
which is the case most of the time).

Here is my API:

- [`komondor(specName, [options]): Spec`](#komondorspecname-options-spec)
- [`komondor.live(specName, [options]): Spec`](#komondorlivespecname-options-spec)
- [`komondor.save(specName, [options], (specName, spec) => void)`](#komondorsavespecname-options-specname-spec--void)
- [`komondor.simulate(specName, [options], (specName, spec) => void)`](#komondorsimulatespecname-options-specname-spec--void)
- [`komondor.teardown()`](#komondorteardown)
- [Tips and Tricks](#tips-and-tricks)
  - [Recorded Demo](#recorded-demo)
  - [Live Debug Recording](#live-debug-recording)
- [Architecture Consideration](#architecture-consideration)
  - [Clean Architecture](#clean-architecture)
  - [Dependency Injection](#dependency-injection)

## `komondor(specName, [options]): Spec`

This is my basic usage.

It will return a [`spec`](./spec.md) object to record or replay the behavior.

Just like [`mockto`], the `Spec` is running in `auto` mode.

What that means is that when when the code executes,
if there is no `SpecRecord` available,
the `Spec` will make the actual calls and record the behavior.
If `SpecRecord` available, the `Spec` will load the record and replay the behavior.

This behavior can be changed through [configuration].

The `specName` is the name of the [`Spec`],
and it needs to be unique within one test file.

The `Spec` instance returned is the same as the one from [`mockto`],
with one difference: it contains the `reporter` property which is a `MemoryLogReporter` from [standard-log].

i.e. here are the two different ways to get the same `reporter` when using [`mockto`] and using me:

```ts
mockto('get friends', (_, _, reporter) => { ... })

// vs
test('get friends', async () => {
  const spec = komondor('get friends')
  spec.reporter
})
```

## `komondor.live(specName, [options]): Spec`

Always run the spec in `live` mode.
Actual calls will be made, and the behavior is not recorded.
These specs are not affected by configuration.

## `komondor.save(specName, [options], (specName, spec) => void)`

Always run the spec in `save` mode regardless if a spec record exists or not.
These specs are not affected by configuration.

## `komondor.simulate(specName, [options], (specName, spec) => void)`

Always run the spec in `simulate` mode.
These specs are not affected by configuration.

## `komondor.teardown()`

`komondor` internally has a time tracker to make sure you have called `spec.done()` at the end of each test,
because that is a very common mistake.

But test runner like `jest` will emit a warning if there are open handles at the end of the test suite (for each file).
`komondor.teardown()` will clear those handles and emit necessary warnings.

```ts
afterAll(() => komondor.teardown())

test('some test', async () => {
  const spec = komondor('some test')
  ...
})
```

## Tips and Tricks

`komondor` shares the same tips and tricks for [`mockto`](./mockto.md#tips-and-tricks).

But it also has its own when it is used in production.

### Recorded Demo

Using `komondor` can record all interactions to any external system.
That means you can create a record, and replay it in a live demo.

### Live Debug Recording

If your customer reports a problem,
you can get into a live debug session with your customer and turn on `komondor` recording.
Then you can record the complete behavior and reproduce it later on.

## Architecture Consideration

To use `komondor` in production code,
there are some architecture best practice you can follow to make it easier.

### Clean Architecture

#### Dependency Injection

Design your application with dependency injection in mind will make it very easy to use `komondor` in production.

All you need to do as passing in the spec'd instance of your dependency, and it will work as is.
When the time is right, call `spec.done()` to save the record.

[introduction]: ./introduction.md
[`mockto`]: ./mockto.md
[configuration]: ./configuration.md
[standard-log]: https://github.com/unional/standard-log
[`Spec`]: ./spec.md
