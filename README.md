# komondor

![unstable][unstable-image]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Codecov][codecov-image]][codecov-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Greenkeeper][greenkeeper-image]][greenkeeper-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]

[![Visual Studio Code][vscode-image]][vscode-url]
[![Wallaby.js][wallaby-image]][wallaby-url]

[![komondor](images/komondor.jpg)](https://github.com/unional/komondor)

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
      // massage the response in some way that make sense to your application.
      const response = messege(res)
      a(response)
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

test('get follower of a user', t => {
  const github = new GitHub()
  const getFollowersSpec = await spec(github.users.getFollowersForUser)

  // do `specs.subject.bind(github.users)` when needed.
  github.users.getFollowersForUser = specs.subject

  const followers = await getFollowers(github, 'someRealUser')

  // (optional) get the actual actions recorded by `komondor` for inspection
  const actions = getFollowersSpec.actions

  console.log(actions)

  // (required) ensure the record will meet your expectation
  await getFollowersSpec.satisfy([
    undefined,
    {
      type: 'fn/callback',
      payload: [null, {
        data: e => e.login && e.id
      }]
    }
  ])
})
```

The code above uses `komondor` to spy on the call and make sure the data received meet your expectation.

`getFollowersSpec.satisfy()` uses [`satisfier`](https://github.com/unional/satisfier) to validate the data.
Please check it out to see how to define your expectation.

Once the test pass again (meaning the spy is working correctly and you have setup the right expectation),
you can now tell `komondor` to save the result.

To do that, all you need to do is adding a option to the `spec()` call to give the spec an `id` and change the mode to `save`:

```ts
  const getFollowersSpec = await spec(
    github.users.getFollowersForUser,
    { id: 'github getFollowersForUser', mode: 'save' }
  )
```

When you run the test, the result will be saved.

### step 3: replay the recorded data

The last step is to tell `komondor` to use the recorded data in the test.

The way to do it is extremely simple.
All you need is to change the `mode` from `save` to `replay`:

```ts
  const getFollowersSpec = await spec(
    github.users.getFollowersForUser,
    { id: 'github getFollowersForUser', mode: 'replay' }
  )
```

That's it! Now your test will be ran using the saved result and not making actual remote calls.

## given

`given` is a construct to declare and verify the fixture of the spec to run on.
It is a mean to communicate between engineer, QA, and possibility IT.
It can consist of `spec`, which is used to configure or validate if the environment is valid.
These specs provide the necessary information for the QA and IT to re-create the fixture.

Alternatively, a service can be provided to get the fixture information at real time,
so that the fixture can be decoupled from the tests.

For example, when a test ask for a "version 1, normal load" environment,
the service can spawn up a new docker container and return the endpoint information to the test.
That means each test can be run in its own environment.

## API

### spec(fn, options)

```ts
function spec<T extends Function>(fn: T, options: Partial<SpecOptions>): Spec<T>

interface SpecOptions {
  /**
   * A unique id of the spec.
   * When saving to file,
   * any '/' in the id will be used as folder separator.
   * i.e. if a spec `id` is `github/getFollowersForUser/success`
   * it will be saved as `<komondor_folder>/github/getFollowersForUser/success.json`
   */
  id: string,
  /**
   * Mode of the spec.
   * `verify` (default) run real call and spy on the result.
   * `save` run real call, spy and save the result.
   * `replay' replay call from saved result.
   */
  mode: 'verify' | 'save' | 'replay'
}
```

## Security

Since `komondor` will record the calls,
if they contain sensitive information you don't want to keep in the record,
you can remove them in the `spec.actions` before you make the `spec.satisfy()` call.

## FAQ

### Nothing happen when I change to save mode

Check if you have wait for `spec.satisfy()`.

i.e., you should have `await yourSpec.satisfy(...)` in your test.

The record will be save once the `satisfy()` call is passed.

This prevent bad information overriding saved good information.

### Using komondor with node-fetch

`node-fetch` and some other libraries provides more features then just handling simple data structure.
For example they support streaming and web-socket.

`komondor` cannot work with them directly because it needs to be able to serialize and deserialize the result.

The response object from `node-fetch` is not serializable:

```ts
import fetch = require('node-fetch')

test('response is complex', async t => {
  const response = await fetch('some url')
  // it contains `.text()` method and others,
  // so it is not serializable.
  const json = JSON.parse(response.text())
})
```

One way to get around this is create a wraping function that returns DTO.
`komondor` can then work on that function.

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

[unstable-image]: https://img.shields.io/badge/stability-unstable-yellow.svg
[npm-image]: https://img.shields.io/npm/v/komondor.svg?style=flat
[npm-url]: https://npmjs.org/package/komondor
[downloads-image]: https://img.shields.io/npm/dm/komondor.svg?style=flat
[downloads-url]: https://npmjs.org/package/komondor
[travis-image]: https://img.shields.io/travis/unional/komondor/master.svg?style=flat
[travis-url]: https://travis-ci.org/unional/komondor?branch=master
[codecov-image]: https://codecov.io/gh/unional/satisfier/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/satisfier
[coveralls-image]: https://coveralls.io/repos/github/unional/komondor/badge.svg
[coveralls-url]: https://coveralls.io/github/unional/komondor
[greenkeeper-image]:https://badges.greenkeeper.io/unional/komondor.svg
[greenkeeper-url]:https://greenkeeper.io/
[semantic-release-image]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[wallaby-image]:https://img.shields.io/badge/wallaby.js-configured-green.svg
[wallaby-url]:https://wallabyjs.com
[vscode-image]:https://img.shields.io/badge/vscode-ready-green.svg
[vscode-url]:https://code.visualstudio.com/
