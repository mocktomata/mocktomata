# `komondor`

This is the user manual for `komondor`.

It is designed for general usage.

If you use [`mocktomata`](https://github.com/mocktomata/mocktomata) in test,
and want to have to more streamlined process,
you can consider using [`mockto`](./mockto.md) instead.

## `komondor(specName, [options]): Spec`

This is the basic usage of `komondor`.

It will return a [`spec`](./spec.md) object to record or replay the behavior.

Here is an example on how to use it:

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
```

For detailed explanation, please check out the [`mockto`](./mockto.md) user manual.

The actual behavior of the call can be controlled by [`configuration`](./configuration.md).

For methods available to `spec`, please check out its [`user manual`](./spec.md).

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

## `komondor.cleanup()`

`komondor` internally has a time tracker to make sure you have called `spec.done()` at the end of each test,
because that is a very common mistake.

But test runner like `jest` will emit a warning if there are open handles at the end of the test suite (for each file).
`komondor.cleanup()` will clear those handles and emit necessary warnings.

```ts
afterAll(() => komondor.cleanup())

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

### Dependency Injection

Design your application with dependency injection in mind will make it very easy to use `komondor` in production.

All you need to do as passing in the spec'd instance of your dependency, and it will work as is.
When the time is right, call `spec.done()` to save the record.
