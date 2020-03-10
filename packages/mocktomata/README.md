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

I am `mockto`, or in short `mt`, the main automaton and your guide for [`mocktomata`](https://github.com/mocktomata/mocktomata).

I can record the behavior of your system.
And I can simulate it.

I can isolate your code from the changes and uncertainty of the outside world.
And I can connect your code back to it by the flip of a switch.

Most of the time, I am summoned by masters when they are writing tests.

Writing tests with me has several benefits over traditional tests.

Traditionally, masters write unit tests, integration tests, and acceptance tests to verify the system is working correctly.

This approach has several drawbacks:

- There are many duplications and overlaps between different type of tests.
- Acceptance tests cannot run during build time.
- Acceptance tests is slow and take a long time to complete.
- Acceptance tests can fail when the external systems are unstable or change without notice.
- Unit tests and integration tests give a false impression that the system is working while in reality the external system does not behave as expected causing the system to fail.
- It is very expensive to setup and teardown environment for acceptance tests, especially when there are many environment variations and application states that are difficult to reach.

Utilizing me can mitigate most of these drawbacks.

Me and my other friends in [`mocktomata`](https://github.com/mocktomata/mocktomata) at your service.

## Installation

```sh
npm install --dev mocktomata
// or
yarn add --dev mocktomata
```

When using [`mocktomata`](https://github.com/mocktomata/mocktomata),
records are saved under the `.mocktomata` folder.
Please check in that folder into your source control.

## mockto

I have been designed for writing tests.

Here is an example on how to work with the [`axios`](https://www.npmjs.com/package/axios) library:

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

mockto('get followers of a user', (title, spec) => {
  // `title` is essentially the same as spec name: 'get followers of a user'.
  // It is provided so that you don't have to repeat the message.
  test(title, async () => {
    // `s` is a spec'd copy of `axios`.
    const s = await spec(axios)

    // use `s` in place of `axios`
    const followers = await getFollowers(s, 'danny')
    expect(followers.length).toBe(10)

    // tell `mockto` the test is done.
    // in `save` mode, this will save the spec record.
    await spec.done()
  })
})
```

When this is executed the first time, I will be running in `save` mode.
I will save the record when calling `await spec.done()`.

When this is executed again, I will be running in `simulate` mode.
I will load the record and replay the behavior.

For tips, tricks, and advance usages, please checkout my [user manual](./docs/mockto.md)

## incubator

## config

## Other use cases

- demo: I can record and simulate external systems so that demo can always run without any hipcups.

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
