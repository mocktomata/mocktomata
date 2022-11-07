Hi there, here is `zucchini`.
I'm the mocktomata specialize in BDD.

I don't know why my name is `zucchini`.
I heard that it's because I'm similar to [cucumber].
But I don't really understand what that means.

Anyway, I'm a lot more powerful than [`mockto`] and [`komondor`].

I can help you to write hundreds of thousands of tests with ease.

I provide two functions: `defineStep()` and `scenario()`.

Anyway, here is how I do the same test (remember, I can do a lot more):

```ts
import axios from 'axios'
import { scenario } from 'mocktomata'

test('get friends', async () => {
  const { spec, done } = scenario('get friends')
  const s = await spec(axios)

  const friends = await getFriends(s, 'miku')
  expect(friends.map(f => f.name)).toEqual(['luka', 'rumi', 'len', 'ren'])

  await done()
})

afterAll(() => scenario.teardown())
```

While that makes me looks like [`komondor`],
but people with sharp eye as you probably notice that this test doesn't use the `defineStep()` function.

And that's a huge miss-out!

`defineStep()` can define reuseable steps with the same behavior simulation,
and you can use them in `scenario()` in multiple ways.

Here is a much better version of the same test:

```ts
import axios from 'axios'
import { defineStep, scenario } from 'mocktomata'

defineStep('get friends of {word}', ({ spec }, name) => {
  const s = await spec(axios)
  return await getFriends(s, name)
})

defineStep('clear friends of {word}', ...)
defineStep('add {word} as a friend of {word}', ...)

test('get friends', async () => {
  const { ensure, setup, run, teardown, done } = scenario('get friends')
  await ensure('clear friends of miku')

  await setup('add luka as a friend of miku')
  await setup('add ren as a friend of miku')

  const friends = await run('get friends of miku')
  expect(friends.map(f => f.name)).toEqual(['luka', 'ren'])

  await teardown('clear friends of miku')

  await done()
})

afterAll(() => scenario.teardown())
```

If you understand how powerful I am,
I would like to be your friend!

Here is my detail API:


## `defineStep(clause: string | RegExp, handler: (context, ...args) => any)`

The `clause` can be a `string` or `RegExp`.
When it is a string, you can use most of the [Cucumber Expression][cucumber-expression] parameter.

You can also define your own parameter using [`defineParameterType`].

Inside the `handler`, you get the `context` and `args`.

The `context` contains 5 properties:

```ts
defineStep('some step', ({ clause, mode, runSubStep, spec, maskValue }) => { ... })
```

`clause` in the input clause in string:

```ts
const { run } = scenario('some scenario')
run('some clause') // <-- this
```

`mode` is the current `SpecMode`.

`runSubStep` allows you to run another step just like the `run` function from `scenario`.

`spec` is the same spec function that you should fall in love by now.

`maskValue` is the same `maskValue()` provided by [`Spec`][spec]


The `args` is also very interesting.
If your `clause` is a `RegExp` and it contains capture group, the value will be in the `args`.
The same if the `clause` is a string and you specify some parameter in it.

What's interesting is that it also pass in some "secret" arguments.
If you run a step with additional arguments, they are passed to `args`:

```ts
const { run } = scenario('some scenario')
run('do something secretive', 1, 2, 3)
```

If you have both expression params (or capture groups) and these additional arguments,
the additional arguments will come after the expression params/capture groups:

```ts
defineStep('set SSN for {word}', (_, name, ssn) => { ... })
```

## `defineParameterType({ name, regex, transformer })`

`defineParameterType` is the way you can define addition parameter type to be used in `defineStep`.

For more details, you can take a look at [cucumber parameter type][cucumber-parameter-type]

## `scenario(specName, [options])`

The `specName` and `options` is nothing special.
They are the same as the one for [`mockto`] and [`komondor`].

What's interesting is the return value.

I returns the following:

- `ensure`: this runs a step to ensure the test environment is clean
- `setup`: this runs a step to setup the test environment (the `given` step)
- `run`: this runs a step as the test
- `teardown`: this runs a step to clean up the test environment

I also returns `spec`, `done`, `ignoreMismatch`, `maskValue`, `mode`, and `reporter`.
They are the same as others, I won't talk about them here.

[cucumber-expression]: https://github.com/cucumber/cucumber-expressions
[spec]: ./spec.md
[cucumber-parameter-type]: https://github.com/cucumber/cucumber-expressions#custom-parameter-types
