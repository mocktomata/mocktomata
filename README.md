# mocktomata

![unstable][unstable-image]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Circle CI][circleci-image]][circleci-url]
[![Travis CI][travis-image]][travis-url]
[![Codecov][codecov-image]][codecov-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Greenkeeper][greenkeeper-image]][greenkeeper-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]

[![Visual Studio Code][vscode-image]][vscode-url]
[![Wallaby.js][wallaby-image]][wallaby-url]

Welcome to [`mocktomata`](https://github.com/mocktomata/mocktomata), master.

[`mocktomata`](https://github.com/mocktomata/mocktomata) is a behavior recording and simulation system.

I am `mockto`, or in short `mt`, the main mechanism and your guide.

I can record the behavior of a part of your system.
And I can simulate that behavior.

I can isolate your code from the fluctuation and uncertainty of the outside world.
And I can let your code connect to the world by the flip of a switch.

Most of the time,
masters utilize me when they write tests.

Utilize me in tests has several benefits over traditional tests.

Traditionally, masteres write unit tests, integration tests, and acceptance tests to verify the system is working correctly.

There are a few drawbacks with this approach:

- There are many duplications and overlaps between different type of tests.
- Acceptance tests cannot run during build time.
- Acceptance tests is slow and take a long time to complete.
- Acceptance tests can fail without control when the external systems are unstable or can change without version management.
- Unit tests and integration tests give a false impression that the system is working while in reality the external system does not behave as expected causing the system to fail.
- There are many variations in environment and application state that are very expensive to setup and teardown to run acceptance tests.

Utilizing me can mitigate most of these drawbacks.

Interested in utilizing me?

[`mocktomata`](https://github.com/mocktomata/mocktomata) at your service.

## Installation

```sh
npm install mocktomata
// or
yarn add mocktomata
```

## Usage

```ts
import axios from 'axios'
import { mockto } from 'mocktomata'

mockto('get followers of a user', (title, m) => {
  test(title, async () => {
    const mockedAxios = m.mock(axios)

    const followers = await getFollowers(mockedAxios, 'danny')

    expect(followers.length).toBe(10)

    await m.done()
  })
})

// or
test('get followers of a user', async () => {
  const m = await mockto('get followers of a user')
  const mockedAxios = m.mock(axios)

  const followers = await getFollowers(mockedAxios, 'danny')

  expect(followers.length).toBe(10)

  await m.done()
})

```

## Other use cases

- demo: I can record and simulate external systems so that demo can always run without any hipcups.


## Wallaby config

Since `mocktomata` will write files to the file system, if you use wallaby you need configure it as follow so that the changed files will be written correctly:

```js
module.exports = () => {
  return {
    'files': [
      // load spec records
      { pattern: '__mocktomata__/**/*', instrument: false },
      ...
    ],
    setup(wallaby) {
      const fs = require('fs');
      if (fs.patched) return;
      const path = require('path');

      const writeFile = fs.writeFileSync;
      fs.writeFileSync = function(file, content) {
        if (/__mocktomata__/.test(file)) {
          writeFile(path.join(wallaby.localProjectDir, file.replace(wallaby.projectCacheDir, '')), content);
        }
        return writeFile.apply(this, arguments);
      }
      const mkdirSync = fs.mkdirSync;
      fs.mkdirSync = function (dir, mode) {
        if (/__mocktomata__/.test(dir)) {
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

## Contribute

```sh
# right after fork
npm install

# begin making changes
git checkout -b <branch>
npm run watch

# edit `webpack.config.dev.js` to exclude dependencies for the global build.

# after making change(s)
git commit -m "<commit message>"
git push

# create PR
```

## Npm Commands

There are a few useful commands you can use during development.

```sh
# Run tests (and lint) automatically whenever you save a file.
npm run watch

# Run tests with coverage stats (but won't fail you if coverage does not meet criteria)
npm run test

# Manually verify the project.
# This will be ran during 'npm preversion' so you normally don't need to run this yourself.
npm run verify

# Build the project.
# You normally don't need to do this.
npm run build

# Run tslint
# You normally don't need to do this as `npm run watch` and `npm version` will automatically run lint for you.
npm run lint
```

[circleci-image]: https://circleci.com/gh/mocktomata/mocktomata/tree/master.svg?style=shield
[circleci-url]: https://circleci.com/gh/mocktomata/mocktomata/tree/master
[codecov-image]: https://codecov.io/gh/unional/satisfier/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/satisfier
[coveralls-image]: https://coveralls.io/repos/github/mocktomata/mocktomata/badge.svg
[coveralls-url]: https://coveralls.io/github/mocktomata/mocktomata
[downloads-image]: https://img.shields.io/npm/dm/mocktomata.svg?style=flat
[downloads-url]: https://npmjs.org/package/mocktomata
[greenkeeper-image]: https://badges.greenkeeper.io/mocktomata/mocktomata.svg
[greenkeeper-url]: https://greenkeeper.io/
[npm-image]: https://img.shields.io/npm/v/mocktomata.svg?style=flat
[npm-url]: https://npmjs.org/package/mocktomata
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[travis-image]: https://img.shields.io/travis/mocktomata/mocktomata/master.svg?style=flat
[travis-url]: https://travis-ci.org/mocktomata/mocktomata?branch=master
[unstable-image]: https://img.shields.io/badge/stability-unstable-yellow.svg
[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
[wallaby-image]: https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]: https://wallabyjs.com
