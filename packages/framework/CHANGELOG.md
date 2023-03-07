# Change Log

## 9.1.1

### Patch Changes

- 612e3a2c: Keep object and function prop keys during `metarize()`.

  So that `Object.keys()` or serialization will have the right information to process the stubs.

## 9.1.0

### Minor Changes

- 39f30fbc: Exports utils functions for plugins.

  Adjust `incubator.config()` to accept `SpecPlugin` directly,
  instead of `PluginModule`.
  This make it easier to use when developing plugins.

  Hide unable to locate plugin warning when subject is number or boolean.
  These are special cases that works fine.

  `SpecPlugin.name` is now a required field.
  Since there is no plugin in the wild at the moment,
  this is not considered a breaking change.

## 9.0.2

### Patch Changes

- 4865b9cb: Replace `specRelativePath` with `specPath`.

  `specRelativePath` is hard to produce as doing `path.relative(process.cwd(), __filename)` should be avoided.

  Because that will fail if the test is loaded in `jsdom` or `happy-dom`.

  Replace with `specPath` makes it easier if we can get a `filename(import.meta)` function that works in all cases.

## 9.0.1

### Patch Changes

- 384f74f3: Add warning on missing class for 'instanceof' check.

## 9.0.0

### Major Changes

- 5cc6cdf4: Remove extra serialization of the metadata.
  This extra serialization is not needed.

  Masking on metadata will work correctly when this is removed.

  It's a breaking change as the `SpecRecord` are incompatible.

- 35edfc6f: Fixing prototype chain.

  Remove `errorPlugin` as it is no longer needed.

  This change causes a breaking change as the `classPlugin` have changed it metadata.

### Patch Changes

- 6cce9bab: Move `stack-utils` usage to context.
  This allow us to use a different implementation for browsers.
- ccece292: Lower timeTracker log to `planck`
- 6b11a647: Improve types of `metarize()` and `demetarize()`.

  Remove the extra type assertions.

- 50792504: Fix some internal circular dependencies

## 8.0.5

## 8.0.4

### Patch Changes

- b90ed403: Do not throw `DuplicateStep` if the handler are identical.

  `vitest` (and may be `jest` too) can load the ESM module file twice,
  in two different worker which share scope.
  Resulting the `defineStep()` is called twice with different handler reference.

## 8.0.3

## 8.0.2

## 8.0.1

### Patch Changes

- 0e7724f1: add `json-bigint` as dependency

## 8.0.0

### Major Changes

- 26d8a59a: Update `metarize()` to capture less info.
  There is need to metarize deep props as those are handled by another instance.

  This simplify the record and the spec record is more readable.
  No need to use `@ungap/structured-clone` anymore.

### Minor Changes

- f8bac214: Add bigint support.
  Add support for `ecmaVersion: 'es2020'`.
  This is experimental at the moment.
  The only new thing it supports is bigint.
- f884ee26: Adjust `main`, `exports`, and `files` fields.
- c300537f: Add support for keyed symbol
- 9dde7ae4: Supports array object with custom methods.

  This is similar to support functions with custom methods,
  just apply to array object.

- f7a37a52: Support generators

### Patch Changes

- 26119f95: Throw errors when unable to resolve relative path from `ssf`
- 6400b462: Can specify type on step callers
- 9652b58c: default `logLevel` to `debug` when `emitLog` is `true`.
- 35290046: Fix `classPlugin` to not calling subject's constructure during simulation.
  This enable support of the `ws` package,
  as `ws.WebSocket` will create the connection in the constructor.

  Exports the build-in plugins for building custom plugins.

- f7a37a52: Remove some dead code

## 7.2.0

### Minor Changes

- 60cf772a: Add mocking support

## 7.1.1

### Patch Changes

- daf55a94: Update `type-plus`

## 7.1.0

### Minor Changes

- 1b8a98a4: Add `Zucchini.Fn` and `Spec.MaskValueFn` type.

  Add `Spec.Options.ssf`.
  This allows tests to create helper functions.

  ```ts
  // some-helpers.ts
  function someHelperFunction(..., options?: Spec.Options) {
    return komondor(..., { ...options, ssf: someHelperFunction })
  }

  // the-test.spec.ts
  it('...', () => {
    const spec = someHelperFunction(...)
  })
  ```

## 7.0.8

### Patch Changes

- 68985c0f: Fix issue when calling `array.sort()`.

  `array.sort()` sorts value in-place, modifying the subject.
  The set calls need to simulated by the plugin.

  Update `tersify` to 3.11.1,
  which supports computed property.

  Computed property is used in `fetch`,
  causing test timeout (throw internally) when logging.

## 7.0.7

### Patch Changes

- d5104f51: Change `MissingAction` behavior.

  Instead of throw and failing the simulation,
  Missing action will now emit a log instead.
  This is because it can occurs naturally due to serialization work.

## 7.0.6

### Patch Changes

- 7c455dd1: Fix array containing object.

  The object was not properly accessed, resulting `{ x: undefined }`.

- 7953176a: Improve planck level action logs format.

  Now callstacks are printed in separate lines

## 7.0.5

### Patch Changes

- b45c312a: Fix `Zucchini`'s `spec()` type

## 7.0.4

### Patch Changes

- 91273a1a: Fix `StepCaller` type.
  It should accepts only `string`, not `string | RegExp`.

## 7.0.3

## 7.0.2

### Patch Changes

- 1dcffc11: Use `@ungap/structured-clone` directly.

  Usage of `@ungap/structured-clone/json` error in `jest` env,
  getting:

  ```sh
  Cannot find module '@ungap/structured-clone/json'
  ```

  Running form Node is working fine.
  So it is probably a bug on `jest` side.

  Chaning to build the function locally should fix the problem.

## 7.0.1

### Patch Changes

- 45ec7c32: Fix zucchini using steps.

  When specing the same subject, the same reference will be used.

  Change `metarize` to use `@ungap/structured-clone` instead of `JSON`.
  This will provide better support of objects with circular references.

- df914861: Fix `ErrorPlugin` to support sub-classes.

## 7.0.0

### Major Changes

- 54a090c: Add `defineParameterType()`.
  The step definition is changed to use the same syntax as in `cucumber`.

  It is more flexible and concise, and support extensions.

- 66f800c: Rename `teardown()` to `cleanup()`.

  So that it won't confuse with `const { teardown } = scenario()`.

- 4b4501e: Changed `maskValue()` behavior.

  It now only accept `string` or `RegExp`, and the `replaceWith` only accepts `string`.

  It now masks logs and the resulting `SpecRecord` only.
  The value will pass through the system intact when possible.

  This is needed so that during `save` mode the sensitive information can be passed correctly to the spec subject.

  This means in certain cases the `save` mode and `simulate` mode will pass the original sensitive value or the masked value around.
  During test, you should not assert the sensitive value directly.

  You can however assert the record does not contain the sensitive information by setting `logLevel` to `logLevels.all`,
  and inspect the log message.

  The log message under `logLevels.all` will contain the spec record.

  For example:

  ```ts
  import { logLevels } from 'standard-log'
  import { mt } from 'mocktomata'
  mt('...', (specName, spec, reporter) => {
  	it(specName, async () => {
  		// ...
  		await spec.done()
  		expect(reporter.getLogMessage()).not.toContain('sensitive')
  	})
  })
  ```

- 47f1174: Fix `maskValue()` to mask correctly when working with complex subject such as axios

### Minor Changes

- 16a4dff: Add `incubator.cleanup()`
  You normally don't need to do this.
  But if there is a bug that cause NodeJS to complain about some event leak,
  this function can be used to clean up.

  Use it during `afterAll()`:

  ```ts
  afterall(() => incubator.cleanup())
  ```

  Update `standard-log`.
  Update `async-fp`
  Update `type-plus`

  Add spec based logger.
  Now each spec will have its own logger,
  making it easier to figure out which spec the log comes from.

  The handlers get a `reporter` which you can inspect the logs within the test.

### Patch Changes

- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.
- 9d332a9: Fix `maskValue()` to handle object with null prop.
- 93e654c: Rename packages:

  - `@mocktomata/file-server` -> `@mocktomata/service`
  - `@mocktomata/io-client` -> `@mocktomata/io-remote`
  - `@mocktomata/io-fs` -> `@mocktomata/nodejs`

  Remove package:

  - `@mocktomata/io-local`: moved inside `@mocktomata/nodejs`

- 6dd32fb: fix!: export ESM only
- 05127fd: re-release. try to fix the nodejs issue

## 7.0.0-beta.17

### Patch Changes

- 4b4501e: Changed `maskValue()` behavior.

  It now only accept `string` or `RegExp`, and the `replaceWith` only accepts `string`.

  It now masks logs and the resulting `SpecRecord` only.
  The value will pass through the system intact when possible.

  This is needed so that during `save` mode the sensitive information can be passed correctly to the spec subject.

  This means in certain cases the `save` mode and `simulate` mode will pass the original sensitive value or the masked value around.
  During test, you should not assert the sensitive value directly.

  You can however assert the record does not contain the sensitive information by setting `logLevel` to `logLevels.all`,
  and inspect the log message.

  The log message under `logLevels.all` will contain the spec record.

  For example:

  ```ts
  import { logLevels } from 'standard-log'
  import { mt } from 'mocktomata'
  mt('...', (specName, spec, reporter) => {
  	it(specName, async () => {
  		// ...
  		await spec.done()
  		expect(reporter.getLogMessage()).not.toContain('sensitive')
  	})
  })
  ```

- 47f1174: Fix `maskValue()` to mask correctly when working with complex subject such as axios

## 7.0.0-beta.16

### Patch Changes

- re-release. try to fix the nodejs issue

## 7.0.0-beta.15

### Patch Changes

- 9d332a9: Fix `maskValue()` to handle object with null prop.

## 7.0.0-beta.14

### Patch Changes

- re-release

## 7.0.0-beta.13

### Patch Changes

- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.

## 7.0.0-beta.12

### Major Changes

- 54a090c: Add `defineParameterType()`.
  The step definition is changed to use the same syntax as in `cucumber`.

  It is more flexible and concise, and support extensions.

### Minor Changes

- 16a4dff: Add `incubator.teardown()`
  You normally don't need to do this.
  But if there is a bug that cause NodeJS to complain about some event leak,
  this function can be used to clean up.

  Use it during `afterAll()`:

  ```ts
  afterall(() => incubator.teardown())
  ```

  Update `standard-log`.
  Update `async-fp`
  Update `type-plus`

  Add spec based logger.
  Now each spec will have its own logger,
  making it easier to figure out which spec the log comes from.

  The handlers get a `reporter` which you can inspect the logs within the test.

### Patch Changes

- 93e654c: Rename packages:

  - `@mocktomata/file-server` -> `@mocktomata/service`
  - `@mocktomata/io-client` -> `@mocktomata/io-remote`
  - `@mocktomata/io-fs` -> `@mocktomata/nodejs`

  Remove package:

  - `@mocktomata/io-local`: moved inside `@mocktomata/nodejs`

- 6dd32fb: fix!: export ESM only

## 7.0.0-beta.11

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 7.0.0-beta.10 (2022-08-06)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.9 (2022-08-06)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.8 (2022-08-06)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.7 (2021-09-04)

### Bug Fixes

- old/spec/package.json to reduce vulnerabilities ([#311](https://github.com/mocktomata/mocktomata/issues/311)) ([d8cc30f](https://github.com/mocktomata/mocktomata/commit/d8cc30fa1f9e678757b4c00333b527d4e2a8d93e))

# 7.0.0-beta.6 (2021-06-08)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.5 (2020-05-01)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.4 (2020-04-01)

### Bug Fixes

- upgrade ramda from 0.26.1 to 0.27.0 ([#297](https://github.com/mocktomata/mocktomata/issues/297)) ([fb67aaa](https://github.com/mocktomata/mocktomata/commit/fb67aaaff56bf9d30a68d937c55603a86dc959cf))

# 7.0.0-beta.3 (2020-03-31)

### Bug Fixes

- upgrade ramda from 0.26.1 to 0.27.0 ([#296](https://github.com/mocktomata/mocktomata/issues/296)) ([2d0e735](https://github.com/mocktomata/mocktomata/commit/2d0e735e22bf8cfc96605b957852ded677c69794))

# 7.0.0-beta.2 (2020-03-24)

### Bug Fixes

- libm should be es2017 ([#295](https://github.com/mocktomata/mocktomata/issues/295)) ([f8a1ce7](https://github.com/mocktomata/mocktomata/commit/f8a1ce73f7a5bb163ecbe96f9e779c73f5a86656))

# 7.0.0-beta.1 (2020-03-23)

**Note:** Version bump only for package @mocktomata/framework

# 7.0.0-beta.0 (2020-03-23)

### Bug Fixes

- throws InvokeMetaMethodAfterSpec() ([bc2ca47](https://github.com/mocktomata/mocktomata/commit/bc2ca4737cbb5f033afebff8fbe6c50dbf8048a9))
- adjust getConfig() ([0c53322](https://github.com/mocktomata/mocktomata/commit/0c53322a78566f274d0327f121e2b42c31e7098c))
- browser config ([4f64e6e](https://github.com/mocktomata/mocktomata/commit/4f64e6ee8f4e0450730df728de93d0dfb252ff60))
- can call incubator.config() mutliple times ([fc1c4bf](https://github.com/mocktomata/mocktomata/commit/fc1c4bf97793d806bdb4ea2fb13978e19f7ef0bd))
- change ignoreMismatch implementation ([0719468](https://github.com/mocktomata/mocktomata/commit/0719468137bd42c017eea5b330c51363d7538a04))
- clean up mismatch simulation errors ([13be02d](https://github.com/mocktomata/mocktomata/commit/13be02d804e9f3336fc4c6ca3e74d4a0856c7872))
- clean up with better coverage ([ea07016](https://github.com/mocktomata/mocktomata/commit/ea070169f32368903fe3b8a5aeb64fc2a67fbb1f))
- cleanup test types ([03a6b7f](https://github.com/mocktomata/mocktomata/commit/03a6b7fa2c9f7ba51c08f17cbd8ed1777320ad27))
- context.setProperty returns true ([9e98092](https://github.com/mocktomata/mocktomata/commit/9e980929cffc0d0adfd92d5a1ce197412d153891))
- downgrade hapi to 18 for Node 10 ([b6db4ff](https://github.com/mocktomata/mocktomata/commit/b6db4ffe4ef54eaaa1c0f9eaa9d8ccac18b8fbf3))
- error trace ([5b3c950](https://github.com/mocktomata/mocktomata/commit/5b3c9500f657616e182e8654023cc9cb32eaf996))
- extra instantiate throws ExtraAction ([5aab389](https://github.com/mocktomata/mocktomata/commit/5aab389db5e93cbaa0f1c0559ec84ff3639d473b))
- extra set throws ExtraAction ([8992f4a](https://github.com/mocktomata/mocktomata/commit/8992f4ab39023ed77d2d941aabd0e35839ec55e3))
- function tostring ([10da3be](https://github.com/mocktomata/mocktomata/commit/10da3be89b1c162f8dca955a7d1d03238d708898))
- handle site properly ([c37af33](https://github.com/mocktomata/mocktomata/commit/c37af3360a43ec6368cca934a5fc8ee87ef84498))
- improve loadPlugins() types ([80b073e](https://github.com/mocktomata/mocktomata/commit/80b073e5d55f933db010ce425d5d9726891310a6))
- indicate missing result action is protentially an error ([cc916f2](https://github.com/mocktomata/mocktomata/commit/cc916f2a93892d9719c950d07e05170239436d97))
- metarize object and function ([c337675](https://github.com/mocktomata/mocktomata/commit/c337675afb0516a2ff4427a71ed48fc68ae22a04))
- move SpecPluginModule and IO under SpecPlugin ([80b1fbc](https://github.com/mocktomata/mocktomata/commit/80b1fbcb66d3fc2e9417523a0dbe5c2dd71dda9f))
- remove extra functions in SpecPlugin ([d362ef1](https://github.com/mocktomata/mocktomata/commit/d362ef1afcd9ad18297499561ddad71564b56ae6))
- remove store from framework ([7bd9ab9](https://github.com/mocktomata/mocktomata/commit/7bd9ab95c535daca823684750146c2a9a1b0fc08))
- reploy of inert value for get/set ([30df399](https://github.com/mocktomata/mocktomata/commit/30df39916854ac4a6daec8570e2d568afccd4b11))
- separate object and function again ([2ce91ce](https://github.com/mocktomata/mocktomata/commit/2ce91ced70f7c06f9ee7bc1d34757750be7cb804))
- set null ([75530cd](https://github.com/mocktomata/mocktomata/commit/75530cdccf2dcb6640c03300b7b23ea65aa14f3c))
- set with wrong string should fail ([9947ea4](https://github.com/mocktomata/mocktomata/commit/9947ea4bee832dbc5577fba70529abf72fd2c804))
- set with wrong type throws ActionMismatch ([97ec4d2](https://github.com/mocktomata/mocktomata/commit/97ec4d2086bdcb1aec37879527cd0599ef6cb743))
- setProperty should return true to proxy ([a27c05b](https://github.com/mocktomata/mocktomata/commit/a27c05b984a60dcdd39baaeb78bdbe6c7af93551))
- source for get/set property ([85d9dfe](https://github.com/mocktomata/mocktomata/commit/85d9dfed3dddaf7453f24a0dc107d25bbf66781c))
- stop timer when throw ([644d438](https://github.com/mocktomata/mocktomata/commit/644d438626c3278cddb6bf54015a021e98db315b))
- support fn.call() ([aa75374](https://github.com/mocktomata/mocktomata/commit/aa75374280c2aa99dcc1a7a70f1a56335e87dd7e))
- support function.toString() ([eadca3a](https://github.com/mocktomata/mocktomata/commit/eadca3acc6ca7f178ea800e03f8e5802adf404e0))
- support in between promise invocation ([3af91c4](https://github.com/mocktomata/mocktomata/commit/3af91c40731ba8fee839ec8b5de39231c96393ac))
- support ioc style instanciation ([becb9d6](https://github.com/mocktomata/mocktomata/commit/becb9d6b164f51780c7ba12647b1bba7c2f0946d))
- support multiple promises ([7f76c72](https://github.com/mocktomata/mocktomata/commit/7f76c72c349c6822dc28f9653888079938bda89f))
- support property type change ([f3b7701](https://github.com/mocktomata/mocktomata/commit/f3b7701724b5359aec4e5331c7bd73b23e556ecf))
- support set on function ([0ff1dac](https://github.com/mocktomata/mocktomata/commit/0ff1dac1a1b5797db378e89e666a8713c87de50b))
- update deps ([c9b3f34](https://github.com/mocktomata/mocktomata/commit/c9b3f3400e887b13271179efd3dbdca70fc899e6))
- **io-fs:** throws PluginNotFound ([162012f](https://github.com/mocktomata/mocktomata/commit/162012fa2e9a88386f2d33258a3defc58e194aae))
- update config to use Mocktomata.Config ([3db967c](https://github.com/mocktomata/mocktomata/commit/3db967cba10cf92ba187ae26397f974db76bcc5b))
- **io-fs:** expose only FileRepository ([3c1200e](https://github.com/mocktomata/mocktomata/commit/3c1200e9b07faa42eea2e285a2210ae626cce16b))
- tug TestHarness types ([81a3d61](https://github.com/mocktomata/mocktomata/commit/81a3d6146d1978b882f7c3362b553702bdfe33ea))
- **io-local:** remove context ([8e3eaa5](https://github.com/mocktomata/mocktomata/commit/8e3eaa5c2a83a3029881d9da417ffc327c801594))
- **mocktomata:** nodejs initContext loads plugins ([7ee0ac2](https://github.com/mocktomata/mocktomata/commit/7ee0ac258281d86ee1ccdd2230b1c78946daab96))

### Features

- add createIncubator() ([18b96b2](https://github.com/mocktomata/mocktomata/commit/18b96b265b5b21fe7dadbe85320ccc6070f19789))
- add createKomondor ([07e7a5e](https://github.com/mocktomata/mocktomata/commit/07e7a5ed7f8a3369de63ce693b73536754754ac9))
- add increment.config() ([de3279c](https://github.com/mocktomata/mocktomata/commit/de3279c777694088f10799963b3c0a9b3a2ebaa3))
- add incubator.start() ([c992e98](https://github.com/mocktomata/mocktomata/commit/c992e985728d06b27765cb1c11893bcacb4a86cb))
- add invokePath to spec ([b0f3c3f](https://github.com/mocktomata/mocktomata/commit/b0f3c3f29f19e540af927cc91c541c0f4b7e1f8f))
- add maskValue() support ([0c2db2b](https://github.com/mocktomata/mocktomata/commit/0c2db2b05f52e9d8ae1de3b9738b73fef56286b4))
- add mockto.enableLog and mockto.showSpecRecord ([a002312](https://github.com/mocktomata/mocktomata/commit/a002312d8e42a4c7c56776eca44976807e59f954))
- add mockto.teardown() ([a03d6a0](https://github.com/mocktomata/mocktomata/commit/a03d6a02254736781d08a9defff9957a5dbb3255))
- add nullPlugin ([9d09430](https://github.com/mocktomata/mocktomata/commit/9d094307683a8c15a0e291f52c45a339541b14d1))
- break getActino to get + retrun/throw ([9f41671](https://github.com/mocktomata/mocktomata/commit/9f41671751bf194993a5cc5dac0dead44656494d))
- clean up types ([15090ec](https://github.com/mocktomata/mocktomata/commit/15090ecd5643f1311f5ea3bd4065d1dc44afd642))
- config log ([32dddb1](https://github.com/mocktomata/mocktomata/commit/32dddb10d17129cb23af834dc9fd64945e230942))
- filter spec mode with spec name and file path ([c3626b5](https://github.com/mocktomata/mocktomata/commit/c3626b5f2ed5ed54e4635641e11ca9b73ce8e75c))
- fix all tests with new context based mockto creation ([a61da9c](https://github.com/mocktomata/mocktomata/commit/a61da9c415368d447fcd8d6392c0cfe361d1bb4f))
- further remove all mention of komondor ([7cac8fe](https://github.com/mocktomata/mocktomata/commit/7cac8febdd247fcc26ed630795f220c9d553eb00))
- hide `id` from plugins ([434f0e1](https://github.com/mocktomata/mocktomata/commit/434f0e18937a0cb66b0f4cba204a8a36a711c225))
- move io-fs to moctomata ([68a9add](https://github.com/mocktomata/mocktomata/commit/68a9add3e79c73c80ec5b771ac3048df8a70c001))
- move mockto to mocktomata ([67b23ea](https://github.com/mocktomata/mocktomata/commit/67b23ea9273e60a5b1dd93c6b478972015eff8a8))
- remove getSpecRecord() ([9e400cd](https://github.com/mocktomata/mocktomata/commit/9e400cdae8a7600d5151ba4a3949973c901aa105))
- remove scenario ([a2d0a1e](https://github.com/mocktomata/mocktomata/commit/a2d0a1e8d6d8607ab37c46dc9895b2973a023cc0))
- rename core to framework ([e9c4666](https://github.com/mocktomata/mocktomata/commit/e9c4666a6e2ae75985b5a931e6f5136ee94cb54c))
- rename incubator.duo() to incubator() ([5de8952](https://github.com/mocktomata/mocktomata/commit/5de89522f067df2b18160584d8d3dcc2bb34c5e6))
- rename spec to mockto ([60a4a14](https://github.com/mocktomata/mocktomata/commit/60a4a14f06e3590a6b587e2648fe3bfae3fa978e))
- rename to mocktomata ([17ffe41](https://github.com/mocktomata/mocktomata/commit/17ffe41eec572337ce683fd4cdb613a3d6394e19))
- rework supports get primitive property again ([2c82ed5](https://github.com/mocktomata/mocktomata/commit/2c82ed5ccb4281696c7470210aba993d9ade7129))
- support array ([188e83a](https://github.com/mocktomata/mocktomata/commit/188e83a75c3cff755e26e4ac1af59b1bc89d6e90))
- support back to throw during get ([d383481](https://github.com/mocktomata/mocktomata/commit/d383481ea00f4d0feea327e8322d179d91d8f380))
- support callbacks in object literals ([8eb5fa0](https://github.com/mocktomata/mocktomata/commit/8eb5fa0763d82e2a259745051c08cb953afd2843))
- support config from env ([86264f6](https://github.com/mocktomata/mocktomata/commit/86264f6140b5104681f9ddaa6a1bd29d90027d23))
- support ignoreMismatch() ([bbef93a](https://github.com/mocktomata/mocktomata/commit/bbef93a090fb7eb1b7711a68803a72f51b155004))
- **framework:** add createMockto() with live ([299fd86](https://github.com/mocktomata/mocktomata/commit/299fd86d314f3befd4a10e4da543b100357b9b6d))
- **framework:** add getSpecConfig() ([963c907](https://github.com/mocktomata/mocktomata/commit/963c907caec570ccdb00d48867d5f081a54970b5))
- **framework:** allow plugin to be not conforming ([4d38710](https://github.com/mocktomata/mocktomata/commit/4d387106ce2e215d22f5a80f91885fb56f85fd03))
- **framework:** complete createMockto() ([e1fdad2](https://github.com/mocktomata/mocktomata/commit/e1fdad270f5488b10fbef12f2d4f1f401f8c215f))
- **framework:** expose code needed for incubator ([882fba8](https://github.com/mocktomata/mocktomata/commit/882fba80960d880ebebd36d2d9a2c2c65a493187))
- support delay callbacks ([f8a529a](https://github.com/mocktomata/mocktomata/commit/f8a529a382c5714b5b85456729390a2de50e55cf))
- support delay invoke internal method ([8d3bad4](https://github.com/mocktomata/mocktomata/commit/8d3bad4fa0873b9c712a863d7e2230d7349ce1dd))
- support get primitive property again ([c182377](https://github.com/mocktomata/mocktomata/commit/c1823774b83d9b09e7c2ef205f734cd9181d059c))
- support primitive method ([158bb23](https://github.com/mocktomata/mocktomata/commit/158bb237d2f51ad411c9d60b9a7f629663c5a441))
- support Promise ([c06a884](https://github.com/mocktomata/mocktomata/commit/c06a884982593bc636a4558b45fe50b662f83bd1))
- support up to basic functions ([2c1a0b3](https://github.com/mocktomata/mocktomata/commit/2c1a0b3703b148942096d8999a020e78ba69991c))
- tug some types under Spec ([1276562](https://github.com/mocktomata/mocktomata/commit/1276562e22e97fb5e930d79db746af36ba20bfcb))
- update to use async-fs@4 ([c75769b](https://github.com/mocktomata/mocktomata/commit/c75769b241eea55af6875a38cfc2d7b94e0a1042))
- **framework:** change Spec signature ([b9d0870](https://github.com/mocktomata/mocktomata/commit/b9d0870816b9a2bc6905d9514f354d64308a5280))
- **framework:** support simulate primitive method ([4e492ac](https://github.com/mocktomata/mocktomata/commit/4e492ac22ae861f0eab5dba46742369e57e083b0))
- use proxy for object plugin ([1b8af55](https://github.com/mocktomata/mocktomata/commit/1b8af55e0efcb52ee586fedf03b06fae6702fa51))
