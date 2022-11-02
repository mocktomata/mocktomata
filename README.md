# Mocktomata

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

[![GitHub NodeJS][github-nodejs]][github-action-url]
[![Codecov][codecov-image]][codecov-url]

[![Visual Studio Code][vscode-image]][vscode-url]

Welcome to [mocktomata], the behavior simulation system.

My name is [`mockto`](#mockto).

I'm the main automaton and your guide around here.

In a nutshell, [mocktomata] saves the behavior of your code,
and simulate it at a later time.

We can isolate your code from the changes and uncertainty of the outside world.
And we can connect your code back to it by a flip of a switch.

That means, instead of manually writing mocks, you can write e2e tests,
and run them as e2e or as unit tests.

## Install

To use [mocktomata],
typically you can install it as a dev dependency:

```sh
# npm
npm install -D mocktomata

# yarn
yarn add -D mocktomata

# pnpm
pnpm install -D mocktomata

# rush
rush add -p mocktomata --dev
```

There are [advance use cases][advance-use-cases] which you can install [mocktomata] as regular dependency.
But we will save that for later.

## Setup

By default,
[mocktomata] saves the behavior of your code under the `.mocktomata` folder.
You should check that folder into your source control.

e.g. for `git`, add that folder to your `.gitignore` file.

## `mockto`

[`mockto`] (me) is one of four automata to simulate behavior.

I specialize in writing tests.

Here is an example on how to work with the [axios] library:

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

// You first call me and give me a unique `specName` within a test file.
// This will be used as the identifier of the test.
// So if you use some grouping mechanism such as `describe()`,
// you need to make sure the `specName` remains unique across all groups.
//
// What I would recommend is to use filenames as a grouping mechanism.
// for example:
//
// - myCode.group1.spec.ts
// - myCode.group2.spec.ts
mockto('get friends', (specName, spec) => {
  // the `specName` is returned to the handler,
  // You can use it as your test description.
  // So you don't have to act like a parrot.
  test(specName, async () => {
    // The `spec()` function tells me which code to simulate.
    // It returns a replacement which you can use it in your code.
    const s = await spec(axios)

    const friends = await getFriends(s, 'miku')
    expect(friends.map(f => f.name)).toEqual(['luka', 'rumi', 'len', 'ren'])

    // `spec.done()` tells me the test completed.
    await spec.done()
  })
})

// as a best practice, call `teardown()` at the end of all test,
// so I can close any loose ends in case you forget to do `await spec.done()` in a test.
afterAll(() => mockto.teardown())
```

I will determine automatically to either perform the actual actions,
or reply the actions when I know the behavior.

There are may more things I can do.
For that, please check out my [user manual][`mockto`] for more information.

By the way, I have an alias `mt` if that's what you prefer.

## `komondor`

Hi, This is `komondor`.

<!-- markdownlint-disable-next-line -->
I used to be a guard dog. <img src="./images/komondor.jpg" alt="komondor" width="20"/>

But nowadays, I'm one of the four automata in the [mocktomata] family.

I also have an alias `kd` if you think my name is too long.

While [`mockto`](#mockto) is specialized for testing,
I'm more general purposed and versatile.

Here is how to write the same test:

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
and you have to repeat the `specName`.

What I'm really good at is when you want to do those [advance use cases][advance-use-cases].

To know more about me, you can check out my ~~caring guide~~ [user manual][`komondor`].

## Zucchini

Hi there, here is [`zucchini`].
I'm the automaton that specialized in BDD.

I don't know why my name is [`zucchini`].
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
defineStep('add {word} as friend of {word}', ...)

test('get friends', async () => {
  const { ensure, setup, run, teardown, done } = scenario('get friends')
  await ensure('clear friends of miku')

  await setup('add luka as friend of miku')
  await setup('add ren as friend of miku')

  const friends = await run('get friends of miku')
  expect(friends.map(f => f.name)).toEqual(['luka', 'ren'])

  await teardown('clear friends of miku')

  await done()
})

afterAll(() => scenario.teardown())
```

If you understand how powerful I am,
I would like to be your friend!

Come check out my [user manual][`zucchini`] at a hurry!

## Incubator

Greetings, I am [`incubator`]. One of four automata in the [mocktomata] family.

I specialize in helping you to create [plugins][plugin].

While [mocktomata] is very capable out of the box,
there could be situations where the default behavior is not sufficient.

Here is where [plugin] comes in.

[mocktomata] is build from the groud up with a very flexible plugin architecture.
Each of the core behavior it record and simlulate are written in a plugin.

So if you encounter a situation where [mocktomata] doesn't support,
you can look for a plugin or write your own.

And I'm here to help.

Here is an example:

```ts
import { incubator } from '@mocktomata/framework'
import { activate } from './your-plugin'

incubator.config({ plugins: [['your-plugin', activate]] })

incubator('some test', (title, spec) => {
  test(title, async () => {
    const s = await spec(YourPluginSubject)
    const actual = specificUsage(s)
    expect(actual).toBe(true)

    await spec.done()
  })
})

afterAll(() => incubator.teardown())
```

The basic way to utilize me is very simular to [`mockto`].

The difference is that I will go through the lifecycle by running the test twice:
once as `${specName}: save` and once as `${specName}: simulate`.

This makes sure your plugin works correctly during the recording and replaying the record.

Please check my [responsibility list][`incubator`] for more information.

## Config

Hi, it's [`mockto`] again.

As mentioned by [`incubator`] above, [mocktomata] supports plugins.

To do that, that's where configuration comes in.

Config can be saved in a config file `mocktomata.json`, or in `package.json` `mocktomata` property.

There are a few things you can configure:

```jsonc
{
  // Plugins to load.
  "plugins": [...],
  // Log Level. Support all levels in `standard-log`
  "logLevel": "error" | "warn" | "info" | "debug",
  // Emit Log to console or not. Default to true.
  "emitLog": true | false,
  // Force automata to run in specific mode.
  "overrideMode": "live" | "save" | "simulate",
  // Filter which spec to run by file path.
  "filePathFilter": "<regex string>",
  // Filter which spec to run by spec name.
  "specNameFilter": "<regex string>"
}
```

Did I mention that you can change your unit tests to acceptance tests by a flip of a switch?
That's the power `overrideMode` provides.
And with `filePathFilter` and `specNameFilter`, you can selectively override the mode for a subset of your tests.

To learn more, please check out the [`configuration manual`][configuration].

## Environment Variables

Beside config in the config file,
you can also override the config using environment variables.

There are 4 environment variables you can use:

- MOCKTOMATA_LOG_LEVEL: `logLevel`
- MOCKTOMATA_MODE: `overrideMode`
- MOCKTOMATA_FILE_PATH_FILTER: `filePathFilter`
- MOCKTOMATA_SPEC_NAME_FILTER: `specNameFilter`

## Wallaby config

Since `mocktomata` will write files to the file system, if you use wallaby you need to configure it as follows so that the changed files will be written correctly:

```js
module.exports = () => {
  return {
    'files': [
      // load spec records
      { pattern: '.mocktomata/**/*', instrument: false },
      ...
    ],
    setup(wallaby) {
      const fs = require('fs');
      if (fs.patched) return;
      const path = require('path');

      const writeFile = fs.writeFileSync;
      fs.writeFileSync = function(file, content) {
        if (/.mocktomata/.test(file)) {
          writeFile(path.join(wallaby.localProjectDir, file.replace(wallaby.projectCacheDir, '')), content);
        }
        return writeFile.apply(this, arguments);
      }
      const mkdirSync = fs.mkdirSync;
      fs.mkdirSync = function (dir, mode) {
        if (/.mocktomata/.test(dir)) {
          mkdirSync(path.join(wallaby.localProjectDir, dir.replace(wallaby.projectCacheDir, '')), mode);
        }
        return mkdirSync.apply(this, arguments);
      }
      fs.patched = true;
    },
    ...
  }
}
```

[`incubator`]: https://github.com/mocktomata/mocktomata/blob/main/docs/incubator.md
[`komondor`]: https://github.com/mocktomata/mocktomata/blob/main/docs/komondor.md
[`mockto`]: https://github.com/mocktomata/mocktomata/blob/main/docs/mockto.md
[`zucchini`]: https://github.com/mocktomata/mocktomata/blob/main/docs/zucchini.md
[advance-use-cases]: https://github.com/mocktomata/mocktomata/blob/main/docs/advance-use-cases.md
[axios]: https://www.npmjs.com/package/axios
[codecov-image]: https://codecov.io/gh/mocktomata/mocktomata/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/mocktomata/mocktomata
[configuration]: https://github.com/mocktomata/mocktomata/blob/main/docs/configuration.md
[cucumber]: https://cucumber.io/docs/guides/overview/
[downloads-image]: https://img.shields.io/npm/dm/mocktomata.svg?style=flat
[downloads-url]: https://npmjs.org/package/mocktomata
[github-action-url]: https://github.com/mocktomata/mocktomata/actions
[github-nodejs]: https://github.com/mocktomata/mocktomata/workflows/release/badge.svg
[mocktomata]: https://github.com/mocktomata/mocktomata/blob/main/packages/mocktomata
[npm-image]: https://img.shields.io/npm/v/mocktomata.svg?style=flat
[npm-url]: https://www.npmjs.com/package/mocktomata
[plugin]: https://github.com/mocktomata/mocktomata/blob/main/docs/plugin.md
[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
