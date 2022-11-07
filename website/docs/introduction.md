---
title: Introduction
---

<img src="/mocktomata/img/mocktomata.png" height="200px" align="right"/>

Welcome to [mocktomata], a behavior simulation system.

My name is [`mockto`](#mockto).

I will be your guide around here.

In a nutshell, [mocktomata] saves the behavior of your code,
and simulate it at a later time.

We can isolate your code from the changes and uncertainty of the outside world.
And we can connect your code back to it by a flip of a switch.

That means, instead of manually writing mocks, you can write e2e tests,
and run them as e2e or as unit tests.

Here is a quick example of how to use myself in a test:

Assume you have a function `getFriends()`,
which will call some remote service to get a list of friends based on the input.
This function is using `axios` and for simplicity for mocking,
the `axios` instance is passed into the function,
a common practice for functional styled programming.

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

When you run this test for the first time,
I will make the actual call to the remote service to validate the behavior.
When the test is completed,
I will save the behavior into a `SpecRecord`.

The next time you run the test again,
I will use the saved `SpecRecord` to replay the behavior.
So the test is running just like a unit test.

When you want to change my behavior,
say you want to do run the test as a e2e test,
or the remote service have changed and you need to update the behavior,
you can change the `SpecMode` by either:

- change `mockto(...)` to `mockto.live(...)` or `mockto.save(...)` for a particular test, or
- call `config(...)` to change the `SpecMode` for all or a filtered list of tests.

You can learn more about these details in subsequent sections.
But first, let me show you how to setup [mocktomata].

[mocktomata]: https://github.com/mocktomata/mocktomata/blob/master/packages/mocktomata
