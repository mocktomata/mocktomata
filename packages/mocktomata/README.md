# mocktomata

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

[![Github NodeJS][github-nodejs]][github-action-url]
[![Codecov][codecov-image]][codecov-url]
[![Codacy Grade Badge][codacy-grade]][codacy-grade-url]
[![Codacy Coverage Badge][codacy-coverage]][codacy-coverage-url]

[![Greenkeeper][greenkeeper-image]][greenkeeper-url]

[![Visual Studio Code][vscode-image]][vscode-url]
[![Wallaby.js][wallaby-image]][wallaby-url]

Hello masters,

My name is [`mockto`](#mockto).
I'm the main automaton and you guide to the [`mocktomata`][mocktomata] system.

In a nut shell, [`mocktomata`][mocktomata] can save the behavior of your code,
and simulate it at a later time.

We can isolate your code from the changes and uncertainty of the outside world.
And we can connect your code back to it by a flip of a switch.

Most of the time, we are summoned by masters when they are writing tests.

Writing tests with us has several benefits over traditional tests.

Traditionally,
masters write different type of tests: unit tests, integration tests, and acceptance tests etc,
to verify the system is working correctly.

This approach has several drawbacks:

- There are many duplications and overlaps between different type of tests.
- Acceptance tests cannot run during build time.
- Acceptance tests is slow and take a long time to complete.
- Acceptance tests can fail when the external systems are unstable or change without notice.
- Unit tests and integration tests give a false impression that the system is working while in reality the external system does not behave as expected causing the system to fail.
- It is very expensive to setup and teardown environment for acceptance tests, especially when there are many environment variations and application states that are difficult to reach.

Utilizing us can mitigate most of these drawbacks.

Besides writing tests, you can also deploy us in production code,
which you can do some very [`advance stuff`][advance-use-cases]

So, welcome to [`mocktomata`][mocktomata],
Me and other automata at your service.

## Installation

```sh
npm install --dev mocktomata
// or
yarn add --dev mocktomata
```

When using [`mocktomata`][mocktomata],
we will record the behavior as `SpecRecord`.
They are saved under the `.mocktomata` folder at the root of your project.
Please check in that folder into your source control.

## mockto

My name is [`mockto`][mockto].
I am an automaton specialized in writing tests.
You can refer to me as `mt`.

Here is an example on how to work with the [`axios`][axios] library:

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

// `mockto(specName, handler)`
// `specName` must be unqique within the test file.
// so you need to be careful when using grouping mechanics such as `describe()`
mockto('get friends', (title, spec) => {
  // `title` is the same as `specName`.
  // It is provided to use as the test title,
  // so you don't need to repeat the message manually.
  test(title, async () => {
    // `spec(subject)` creates a substitute to be used in place of the `subject`
    const s = await spec(axios)

    const friends = await getFriends(s, 'miku')
    expect(friends.map(f => f.name)).toEqual(['luka', 'rumi', 'len', 'ren'])

    // indicates the spec is completed.
    await spec.done()
  })
})
```

That is typically all you need to do.
Internally, I'll record the behavior and replay it as needed.

Of course, I can do a lot more.
Please check out my [user manual][mockto] for more information.

## komondor

Hi, I'm `komondor`.
I used to be a guard dog.
But as time passes, I become a part of the [`mocktomata`][mocktomata] family as an automaton.
Masters can also call me `kd` if you like.

While [`mockto`](#mockto) is specialized for testing,
I'm more general purposed and versatile.

Here is how masters dispatch me in the same [`axios`][axios] example:

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

If you want to use [`mocktomata`][mocktomata] in production for [`advance usage`][advance-use-cases],
I'm the one you can depend on.

To know more about me, you can check out my ~~raising guide~~ [`user manual`][komondor].

## incubator

My name is `incubator`, master.

I am specialized in helping masters to create [`plugins`][plugin].

The way I work is very similar to [`mockto`](#mockto):

```ts
import { incubator } from 'mocktomata'
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
```

The difference is I will go through the lifecycle of `SpecRecord` by running the test twice:
once as `${specName}: save` and once as `${specName}: simulate`.

Also, the `SpecRecord` is stored in memory and not written to file.

Please checout my [responsibility list][incubator] for more information.

## configuration

Hi, it's `mockto` again.

By default, [`mocktomata`][mocktomata]) works out-of-the-box without any configuration.
It should be able to cover most of the use cases for testing.

But you can configure [`mocktomata`][mocktomata]) to do more things such as using additional plugins, and changing the behavior of the `auto` mode.

Did I mentioned that you can change your unit tests to acceptance tests by a flip of a switch?

To learn more, please chect out the [`configuration manual`][configuration].

## Wallaby config

Since `mocktomata` will write files to the file system, if you use wallaby you need configure it as follow so that the changed files will be written correctly:

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

[npm-image]: https://img.shields.io/npm/v/mocktomata.svg?style=flat
[npm-url]: https://www.npmjs.com/package/mocktomata
[downloads-image]: https://img.shields.io/npm/dm/mocktomata.svg?style=flat
[downloads-url]: https://npmjs.org/package/mocktomata

[github-nodejs]: https://github.com/mocktomata/mocktomata/workflows/Node%20CI/badge.svg
[github-action-url]: https://github.com/mocktomata/mocktomata/actions
[codecov-image]: https://codecov.io/gh/mocktomata/mocktomata/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/mocktomata/mocktomata
[codacy-grade]: https://api.codacy.com/project/badge/Grade/bcb8e88109b54a7593cfe6744c6dac38
[codacy-grade-url]: https://www.codacy.com/gh/mocktomata/mocktomata?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mocktomata/mocktomata&amp;utm_campaign=Badge_Grade
[codacy-coverage]: https://api.codacy.com/project/badge/Coverage/bcb8e88109b54a7593cfe6744c6dac38
[codacy-coverage-url]: https://www.codacy.com/manual/mocktomata/mocktomata?utm_source=github.com&utm_medium=referral&utm_content=mocktomata/mocktomata&utm_campaign=Badge_Coverage

[greenkeeper-image]: https://badges.greenkeeper.io/mocktomata/mocktomata.svg
[greenkeeper-url]: https://greenkeeper.io/

[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
[wallaby-image]: https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]: https://wallabyjs.com

[axios]: https://www.npmjs.com/package/axios
[advance-use-cases]: https://github.com/mocktomata/mocktomata/blob/master/docs/advance-use-cases.md
[configuration]: https://github.com/mocktomata/mocktomata/blob/master/docs/configuration.md
[incubator]: https://github.com/mocktomata/mocktomata/blob/master/docs/incubator.md
[komondor]: https://github.com/mocktomata/mocktomata/blob/master/docs/komondor.md
[mockto]: https://github.com/mocktomata/mocktomata/blob/master/docs/mockto.md
[mocktomata]: https://github.com/mocktomata/mocktomata/blob/master/packages/mocktomata
[plugin]: https://github.com/mocktomata/mocktomata/blob/master/docs/plugin.md
[spec]: https://github.com/mocktomata/mocktomata/blob/master/docs/spec.md
