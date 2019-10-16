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

[`mocktomata`](https://github.com/mocktomata/mocktomata) is a behavior tracking and simulation system.

It can capture and simulate the behavior of a part of your system,
so that you can write test and run them in a controlled manner.


`komondor` is your friendly guard dog for writing tests across boundaries.

## The problem

Boundary is where two systems meet and communicate with each other using data structures and primitive types.

For example, making calls to a remote server or a component written by another team in another language.

When we write tests that needs to communicate across the boundary,
we often need to create a test double to similate the behavior.

This allow us to write tests that are fast to run and also decouple from the remote system,
so that we don't have to configure the remote system to produce the expected behavior.

However, if we only have these tests,
we will not be able to catch breakage when the remote system changes its behavior.

Traditionally, we will have a suite of system integration test to make sure the system is working as a whole.
However, these tests are hard to configure and slow.
Most of the time we can only create or run a handful of these tests to make sure all or part of the critical paths are covered.

When the behavior of the other system is changed,
you have to go through some manual process to make actual calls,
adjust the test doubles you have, and fix the code.

That's a lot of manual work and the worst of all it reduces the level of trust you have on your test suite.

## The solution

`komondor` can turn your stubbed unit test to system integration test by a simple switch.
It also makes writing these tests systematic and simple.

When writing a test that needs to access a remote system across a boundary,
you will do a three steps test-waltz:

- write a test and making it pass while making actual remote calls
- find out and record the data you recevied from the remote calls
- use the recorded data to create a test double and use the test double in the test

Using `komondor`, these three steps becomes very straight forward.

The following example will create a test that needs to communicate to GitHub api.

### step 1: writing a passing test with actual remote calls

Step 1 is writing a passing test.
Your logic should be unit testable,
i.e. you can create a test double to mock out the remote calls.
It should be the same as what you have been doing.

```ts
import { test } from 'ava'

// test subject
function getFollowers(github: GitHub, username: string) {
  return new Promise((a, r) => {
    github.users.getFollowersForUser({
      username
    }, (err, res) => {
      if (err) r(err)
      else {
        // massage the response in some way that make sense to your application.
        const response = messege(res)
        a(response)
      }
    })
  })
}

test('get follower of a user', t => {
  const github = new GitHub()

  const followers = await getFollowers(github, 'someRealUser')

  // assert `followers` is correct.
})
```

### step 2: find out and record the data

The test is passing.
Now it is time to figure out the shape of the data (which you probably already know as you consumed it),
and tell `komondor` to save the data.

First thing to do is to use `komondor` to spy on the data.
You can do this in step 1, but I'm doing it here to make the steps more concrete for demostration purpose.

Unchange (and uninterested) lines from the code above are omitted for clarity.

```ts
...
import { spec } from 'komondor'

// test subject
...

test('get follower of a user', async t => {
  const github = new GitHub()
  const s = await spec(github.users.getFollowersForUser)

  // do `specs.subject.bind(github.users)` if needed.
  github.users.getFollowersForUser = specs.subject

  const followers = await getFollowers(github, 'someRealUser')

  // (optional) get the actual actions recorded by `komondor` for inspection
  console.log(s.actions)

  // (required) tells spec that it is ready to save the record (in save mode).
  await s.done()
})
```

The code above uses `komondor` to spy on the call and make sure the data received meet your expectation.

Once the test pass again (meaning the spy is working correctly and you have setup the right expectation),
you can now tell `komondor` to save the result.

To do that, all you need to do is changing the call from `spec()` to `spec.save()` and provide an `id`:

```ts
  const s = await spec.save(
    'github getFollowersForUser',
    github.users.getFollowersForUser)
```

Note that the `id` needs to be unique across all tests.
And in version 6, it cannot contain any invalid characters for file name.
This will be improved in version 7.

When you run the test, the result will be saved.

### step 3: replay the recorded data

The last step is to tell `komondor` to use the recorded data in the test.

The way to do it is extremely simple.
All you need is to change the call from `spec.save()` to `spec.simulate()`:

```ts
  const s = await spec.simulate(
    'github getFollowersForUser',
    github.users.getFollowersForUser)
```

That's it! Now your test will be ran using the saved result and not making actual remote calls.

## scenario

You can use `scenario()` to execute test steps defined using the `defineStep()` function.
You can execute the test steps in different context:

- `ensure()`: run the test step and ignore any error. This is used for clean up before and after the test.
- `setup()`: run a setup test step. Any failure will not fail the test, but a warning message will be printed.
- `run()`: run a test step.
- `spec()`: run a custom spec, if your tests are unique and do not need to be defined as a test step.
- `teardown()`: run a teardown test step. Behavior is the same as `setup()`\

## artifact

Sometimes the input used in test are environment or time dependent, e.g. absolute path, `new Date()`, or random number.
Those value does not work well with `komondor` because `komondor` will compare the actions performed to make sure they are the same.

For those values, you can use `artifact()` to tell `komonodor` to ignore them during validation.

## API

### spec()

```ts
function spec<T>(subject: T): Promise<Spec<T>>
function spec<T>(name: string, subject: T): Promise<Spec<T>>
function spec.save<T>(name: string, subject: T): Promise<Spec<T>>
function spec.simulate<T>(name: string, subject: T): Promise<Spec<T>>
```

## Plugins

`komondor` supports plugins to spec on subjects other than basic function, class, and promise.

- [`komondor-plugin-node`](https://github.com/mocktomata/mocktomata-plugin-node)
- [`komondor-plugin-ws`](https://github.com/mocktomata/mocktomata-plugin-ws)

To create a plugin, please check [`komondor-plugin`](https://github.com/mocktomata/mocktomata-plugin)

## Security

Since `komondor` will record the calls,
if they contain sensitive information you don't want to keep in the record,
you can remove them in the `spec.actions` before you make the `spec.done()` call.

## speced.satisfy(expectations)

You can use this method instead of `speced.done()` if you want to validate the call has been performed correctly.

It is generally better than `speced.done()`;
however, since there are still come changes need to be made to the spec record before it is stable,
using `speced.done()` saves you some tendious work in updating the expectations before that happens.

## FAQ

### Nothing happen when I change to save mode

Check if you have wait for `speced.done()`.

i.e., you should have `await yourSpec.done(...)` in your test.

The record will be save when `done()` resolves.

### Enable komondor log

`komondor` provides some logs for debugging purpose.
Since they are chatty, they are turned off by default.

To enable them, do the following:

```ts
import { addAppender, getLogger, logLevel } from '@unional/logging'
import { ColorAppender } from 'aurelia-logging-color'

// Skip if you have already done this for other purpose, or
// you are already using a different appender.
addAppender(new ColorAppender())

getLogger('komondor').setLevel(logLevel.debug)
```

### Using komondor with complex subject

Out of the box, `komondor` cannot handles subject that returns another function or returns object that contains functions.

For example, `node-fetch` supports streaming and web-socket.

The response object from `node-fetch` is not serializable.

To work with these subjects, you can:

- create a plugin
- wrap it to reutrn DTO.

```ts
import fetch = require('node-fetch')

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  return JSON.parse(response.text())
}

test('komondor can work with fetchJson', async t => {
  const yourSpec = await spec(fetchJson)
  const json = await yourSpec.fn('someUri')

  yourSpec.satisfy({ ... })
})
```

Creating `fetchJson()` is actually a good practice because it creates a separation between the layer.
Your application code uses `fetchJson()` instead of `fetch()`,
meaning it does not know the information comes from the network.

(yes, for that you should give it a more netural name and remove the HTTP specific options)

### Test fails after upgrade

Since the libary is still in unstable stage,
when you upgrade to a version,
your test may break even if there is no breaking change.

It is due to the under lying record change and features being added.

You should able to get them pass again by running the `spec` and `scenario` in `save` mode to update the record.
After you do that the test should pass again.

The easiest way to do that is using `config`:

```ts
import { config } from 'komondor'

config.spec('save')
config.scenario('save')
```

Depends on your test environment,
you may use the filter to run only a subset of test in `save` mode,
fitting the actual environment you can configure at a particular time.

## Wallaby config

Since `komondor` will write files to the file system, if you use wallaby you need configure it as follow so that the changed files will be written correctly:

```js
module.exports = () => {
  return {
    'files': [
      // load spec records
      { pattern: '__komondor__/**/*', instrument: false },
      ...
    ],
    setup(wallaby) {
      const fs = require('fs');
      if (fs.patched) return;
      const path = require('path');

      const writeFile = fs.writeFileSync;
      fs.writeFileSync = function(file, content) {
        if (/__komondor__/.test(file)) {
          writeFile(path.join(wallaby.localProjectDir, file.replace(wallaby.projectCacheDir, '')), content);
        }
        return writeFile.apply(this, arguments);
      }
      const mkdirSync = fs.mkdirSync;
      fs.mkdirSync = function (dir, mode) {
        if (/__komondor__/.test(dir)) {
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
[downloads-image]: https://img.shields.io/npm/dm/komondor.svg?style=flat
[downloads-url]: https://npmjs.org/package/komondor
[greenkeeper-image]: https://badges.greenkeeper.io/mocktomata/mocktomata.svg
[greenkeeper-url]: https://greenkeeper.io/
[npm-image]: https://img.shields.io/npm/v/komondor.svg?style=flat
[npm-url]: https://npmjs.org/package/komondor
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[travis-image]: https://img.shields.io/travis/mocktomata/mocktomata/master.svg?style=flat
[travis-url]: https://travis-ci.org/mocktomata/mocktomata?branch=master
[unstable-image]: https://img.shields.io/badge/stability-unstable-yellow.svg
[vscode-image]: https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]: https://code.visualstudio.com/
[wallaby-image]: https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]: https://wallabyjs.com
