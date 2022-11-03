# Change Log

## 7.0.0-beta.13

### Patch Changes

- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.
- Updated dependencies [24b61b1]
  - @mocktomata/framework@7.0.0-beta.13
  - @mocktomata/io-remote@7.0.0-beta.13
  - @mocktomata/nodejs@7.0.0-beta.13
  - @mocktomata/service@7.0.0-beta.13

## 7.0.0-beta.12

### Patch Changes

- b73a048: Move cli code to `@mocktomata/cli`
- 93e654c: Rename packages:

  - `@mocktomata/file-server` -> `@mocktomata/service`
  - `@mocktomata/io-client` -> `@mocktomata/io-remote`
  - `@mocktomata/io-fs` -> `@mocktomata/nodejs`

  Remove package:

  - `@mocktomata/io-local`: moved inside `@mocktomata/nodejs`

- 6dd32fb: fix!: export ESM only
- Updated dependencies [54a090c]
- Updated dependencies [93e654c]
- Updated dependencies [6dd32fb]
- Updated dependencies [16a4dff]
  - @mocktomata/framework@7.0.0-beta.12
  - @mocktomata/io-remote@7.0.0-beta.12
  - @mocktomata/nodejs@7.0.0-beta.12
  - @mocktomata/service@7.0.0-beta.12

## 7.0.0-beta.11

### Patch Changes

- Updated dependencies [424b643]
  - @mocktomata/file-server@7.0.0-beta.11
  - @mocktomata/io-client@7.0.0-beta.11
  - @mocktomata/framework@7.0.0-beta.11
  - @mocktomata/io-local@7.0.0-beta.11

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 7.0.0-beta.10 (2022-08-06)

**Note:** Version bump only for package mocktomata

# 7.0.0-beta.9 (2022-08-06)

**Note:** Version bump only for package mocktomata

# 7.0.0-beta.8 (2022-08-06)

**Note:** Version bump only for package mocktomata

# 7.0.0-beta.7 (2021-09-04)

### Bug Fixes

- old/spec/package.json to reduce vulnerabilities ([#311](https://github.com/mocktomata/mocktomata/issues/311)) ([d8cc30f](https://github.com/mocktomata/mocktomata/commit/d8cc30fa1f9e678757b4c00333b527d4e2a8d93e))

# 7.0.0-beta.6 (2021-06-08)

**Note:** Version bump only for package mocktomata

# 7.0.0-beta.5 (2020-05-01)

**Note:** Version bump only for package mocktomata

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

**Note:** Version bump only for package mocktomata

# 7.0.0-beta.0 (2020-03-23)

### Bug Fixes

- adjust getConfig() ([0c53322](https://github.com/mocktomata/mocktomata/commit/0c53322a78566f274d0327f121e2b42c31e7098c))
- browser config ([4f64e6e](https://github.com/mocktomata/mocktomata/commit/4f64e6ee8f4e0450730df728de93d0dfb252ff60))
- browser namespace. config log in browser ([cf3277f](https://github.com/mocktomata/mocktomata/commit/cf3277fb62b5afd856bac6796eefd4d60aca2adb))
- can call incubator.config() mutliple times ([fc1c4bf](https://github.com/mocktomata/mocktomata/commit/fc1c4bf97793d806bdb4ea2fb13978e19f7ef0bd))
- remove extra param ([8862e66](https://github.com/mocktomata/mocktomata/commit/8862e66e15e7b4d3e4ad8df5b2627dbc2568de0b))
- remove store from framework ([7bd9ab9](https://github.com/mocktomata/mocktomata/commit/7bd9ab95c535daca823684750146c2a9a1b0fc08))
- rename cli from mocktomata to mt ([74b4033](https://github.com/mocktomata/mocktomata/commit/74b4033d9b00df536f642abcf9e303fff7368546))
- set null ([75530cd](https://github.com/mocktomata/mocktomata/commit/75530cdccf2dcb6640c03300b7b23ea65aa14f3c))
- update config to use Mocktomata.Config ([3db967c](https://github.com/mocktomata/mocktomata/commit/3db967cba10cf92ba187ae26397f974db76bcc5b))
- update deps ([c9b3f34](https://github.com/mocktomata/mocktomata/commit/c9b3f3400e887b13271179efd3dbdca70fc899e6))
- **io-fs:** expose only FileRepository ([3c1200e](https://github.com/mocktomata/mocktomata/commit/3c1200e9b07faa42eea2e285a2210ae626cce16b))
- **io-fs:** throws PluginNotFound ([162012f](https://github.com/mocktomata/mocktomata/commit/162012fa2e9a88386f2d33258a3defc58e194aae))
- **mocktomata:** nodejs initContext loads plugins ([7ee0ac2](https://github.com/mocktomata/mocktomata/commit/7ee0ac258281d86ee1ccdd2230b1c78946daab96))
- **mocktomata:** test with pathEqual ([3dd47ec](https://github.com/mocktomata/mocktomata/commit/3dd47ecfef57a9c6c78aa1149b1cbd47a77dbfaf))
- stop timer when throw ([644d438](https://github.com/mocktomata/mocktomata/commit/644d438626c3278cddb6bf54015a021e98db315b))
- update clibuilder ([03cd954](https://github.com/mocktomata/mocktomata/commit/03cd954e171d9cfd2f7697ebaeae0058d03fc95a))

### Features

- add increment.config() ([de3279c](https://github.com/mocktomata/mocktomata/commit/de3279c777694088f10799963b3c0a9b3a2ebaa3))
- **mocktomata:** add komondor, kd ([b00c0bd](https://github.com/mocktomata/mocktomata/commit/b00c0bdd3c8fca549f41371484dc4ac2e53a9225))
- **mocktomata:** add mt alias ([ca06f2b](https://github.com/mocktomata/mocktomata/commit/ca06f2b4687eff4fce8941564f9be9db86df365d))
- add createIncubator() ([18b96b2](https://github.com/mocktomata/mocktomata/commit/18b96b265b5b21fe7dadbe85320ccc6070f19789))
- add incubator.start() ([c992e98](https://github.com/mocktomata/mocktomata/commit/c992e985728d06b27765cb1c11893bcacb4a86cb))
- add mockto.enableLog and mockto.showSpecRecord ([a002312](https://github.com/mocktomata/mocktomata/commit/a002312d8e42a4c7c56776eca44976807e59f954))
- clean up types ([15090ec](https://github.com/mocktomata/mocktomata/commit/15090ecd5643f1311f5ea3bd4065d1dc44afd642))
- config log ([32dddb1](https://github.com/mocktomata/mocktomata/commit/32dddb10d17129cb23af834dc9fd64945e230942))
- expose startServer() ([ae47ef5](https://github.com/mocktomata/mocktomata/commit/ae47ef5d80672a2bb307937ba3fa472f2f62a328))
- fix all tests with new context based mockto creation ([a61da9c](https://github.com/mocktomata/mocktomata/commit/a61da9c415368d447fcd8d6392c0cfe361d1bb4f))
- further remove all mention of komondor ([7cac8fe](https://github.com/mocktomata/mocktomata/commit/7cac8febdd247fcc26ed630795f220c9d553eb00))
- hide `id` from plugins ([434f0e1](https://github.com/mocktomata/mocktomata/commit/434f0e18937a0cb66b0f4cba204a8a36a711c225))
- move mockto to mocktomata ([67b23ea](https://github.com/mocktomata/mocktomata/commit/67b23ea9273e60a5b1dd93c6b478972015eff8a8))
- rename spec to mockto ([60a4a14](https://github.com/mocktomata/mocktomata/commit/60a4a14f06e3590a6b587e2648fe3bfae3fa978e))
- rename to mocktomata ([17ffe41](https://github.com/mocktomata/mocktomata/commit/17ffe41eec572337ce683fd4cdb613a3d6394e19))
- support config from env ([86264f6](https://github.com/mocktomata/mocktomata/commit/86264f6140b5104681f9ddaa6a1bd29d90027d23))
- tug some types under Spec ([1276562](https://github.com/mocktomata/mocktomata/commit/1276562e22e97fb5e930d79db746af36ba20bfcb))
- update to use async-fs@4 ([c75769b](https://github.com/mocktomata/mocktomata/commit/c75769b241eea55af6875a38cfc2d7b94e0a1042))
- **framework:** change Spec signature ([b9d0870](https://github.com/mocktomata/mocktomata/commit/b9d0870816b9a2bc6905d9514f354d64308a5280))
- use proxy for object plugin ([1b8af55](https://github.com/mocktomata/mocktomata/commit/1b8af55e0efcb52ee586fedf03b06fae6702fa51))
