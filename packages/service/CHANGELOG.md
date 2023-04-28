# Change Log

## 9.2.0

### Patch Changes

- Updated dependencies [8cb074f6]
- Updated dependencies [2d567309]
- Updated dependencies [5119b462]
  - @mocktomata/framework@9.2.0
  - @mocktomata/nodejs@9.2.0

## 9.1.2

### Patch Changes

- Updated dependencies [75ac2864]
  - @mocktomata/framework@9.1.2
  - @mocktomata/nodejs@9.1.2

## 9.1.1

### Patch Changes

- Updated dependencies [612e3a2c]
  - @mocktomata/framework@9.1.1
  - @mocktomata/nodejs@9.1.1

## 9.1.0

### Patch Changes

- Updated dependencies [39f30fbc]
  - @mocktomata/framework@9.1.0
  - @mocktomata/nodejs@9.1.0

## 9.0.2

### Patch Changes

- Updated dependencies [4865b9cb]
  - @mocktomata/framework@9.0.2
  - @mocktomata/nodejs@9.0.2

## 9.0.1

### Patch Changes

- Updated dependencies [384f74f3]
  - @mocktomata/framework@9.0.1
  - @mocktomata/nodejs@9.0.1

## 9.0.0

### Minor Changes

- 60102758: Change url to `/api`

### Patch Changes

- d04470e0: Update port to 3689 as it used to be.
- 6cce9bab: Move `stack-utils` usage to context.
  This allow us to use a different implementation for browsers.
- Updated dependencies [6cce9bab]
- Updated dependencies [ccece292]
- Updated dependencies [5cc6cdf4]
- Updated dependencies [35edfc6f]
- Updated dependencies [6b11a647]
- Updated dependencies [50792504]
  - @mocktomata/framework@9.0.0
  - @mocktomata/nodejs@9.0.0

## 8.0.5

### Patch Changes

- @mocktomata/framework@8.0.5
- @mocktomata/nodejs@8.0.5

## 8.0.4

### Patch Changes

- Updated dependencies [b90ed403]
  - @mocktomata/framework@8.0.4
  - @mocktomata/nodejs@8.0.4

## 8.0.3

### Patch Changes

- @mocktomata/framework@8.0.3
- @mocktomata/nodejs@8.0.3

## 8.0.2

### Patch Changes

- @mocktomata/framework@8.0.2
- @mocktomata/nodejs@8.0.2

## 8.0.1

### Patch Changes

- Updated dependencies [0e7724f1]
  - @mocktomata/framework@8.0.1
  - @mocktomata/nodejs@8.0.1

## 8.0.0

### Minor Changes

- f884ee26: Adjust `main`, `exports`, and `files` fields.

### Patch Changes

- Updated dependencies [26119f95]
- Updated dependencies [f8bac214]
- Updated dependencies [f884ee26]
- Updated dependencies [6400b462]
- Updated dependencies [c300537f]
- Updated dependencies [9dde7ae4]
- Updated dependencies [f7a37a52]
- Updated dependencies [26d8a59a]
- Updated dependencies [9652b58c]
- Updated dependencies [35290046]
- Updated dependencies [f7a37a52]
  - @mocktomata/framework@8.0.0
  - @mocktomata/nodejs@8.0.0

## 7.2.0

### Patch Changes

- Updated dependencies [60cf772a]
  - @mocktomata/framework@7.2.0
  - @mocktomata/nodejs@7.2.0

## 7.1.1

### Patch Changes

- daf55a94: Update `type-plus`
- Updated dependencies [daf55a94]
  - @mocktomata/framework@7.1.1
  - @mocktomata/nodejs@7.1.1

## 7.1.0

### Patch Changes

- Updated dependencies [1b8a98a4]
  - @mocktomata/framework@7.1.0
  - @mocktomata/nodejs@7.1.0

## 7.0.8

### Patch Changes

- Updated dependencies [68985c0f]
  - @mocktomata/framework@7.0.8
  - @mocktomata/nodejs@7.0.8

## 7.0.7

### Patch Changes

- Updated dependencies [d5104f51]
  - @mocktomata/framework@7.0.7
  - @mocktomata/nodejs@7.0.7

## 7.0.6

### Patch Changes

- Updated dependencies [7c455dd1]
- Updated dependencies [7953176a]
  - @mocktomata/framework@7.0.6
  - @mocktomata/nodejs@7.0.6

## 7.0.5

### Patch Changes

- Updated dependencies [b45c312a]
  - @mocktomata/framework@7.0.5
  - @mocktomata/nodejs@7.0.5

## 7.0.4

### Patch Changes

- Updated dependencies [91273a1a]
  - @mocktomata/framework@7.0.4
  - @mocktomata/nodejs@7.0.4

## 7.0.3

### Patch Changes

- @mocktomata/framework@7.0.3
- @mocktomata/nodejs@7.0.3

## 7.0.2

### Patch Changes

- Updated dependencies [1dcffc11]
  - @mocktomata/framework@7.0.2
  - @mocktomata/nodejs@7.0.2

## 7.0.1

### Patch Changes

- Updated dependencies [45ec7c32]
- Updated dependencies [df914861]
  - @mocktomata/framework@7.0.1
  - @mocktomata/nodejs@7.0.1

## 7.0.0

### Patch Changes

- 424b643: Update `boom` to `@hapi/boom`
- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.
- 93e654c: Rename packages:

  - `@mocktomata/file-server` -> `@mocktomata/service`
  - `@mocktomata/io-client` -> `@mocktomata/io-remote`
  - `@mocktomata/io-fs` -> `@mocktomata/nodejs`

  Remove package:

  - `@mocktomata/io-local`: moved inside `@mocktomata/nodejs`

- 6dd32fb: fix!: export ESM only
- 05127fd: re-release. try to fix the nodejs issue
- Updated dependencies [54a090c]
- Updated dependencies [66f800c]
- Updated dependencies [4b4501e]
- Updated dependencies [47f1174]
- Updated dependencies [24b61b1]
- Updated dependencies [9d332a9]
- Updated dependencies [93e654c]
- Updated dependencies [6dd32fb]
- Updated dependencies [05127fd]
- Updated dependencies [16a4dff]
  - @mocktomata/framework@7.0.0
  - @mocktomata/nodejs@7.0.0

## 7.0.0-beta.17

### Patch Changes

- Updated dependencies [4b4501e]
- Updated dependencies [47f1174]
  - @mocktomata/framework@7.0.0-beta.17
  - @mocktomata/nodejs@7.0.0-beta.17

## 7.0.0-beta.16

### Patch Changes

- re-release. try to fix the nodejs issue
- Updated dependencies
  - @mocktomata/framework@7.0.0-beta.16
  - @mocktomata/nodejs@7.0.0-beta.16

## 7.0.0-beta.15

### Patch Changes

- Updated dependencies [9d332a9]
  - @mocktomata/framework@7.0.0-beta.15
  - @mocktomata/nodejs@7.0.0-beta.15

## 7.0.0-beta.14

### Patch Changes

- re-release
- Updated dependencies
  - @mocktomata/nodejs@7.0.0-beta.14
  - @mocktomata/framework@7.0.0-beta.14

## 7.0.0-beta.13

### Patch Changes

- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.
- Updated dependencies [24b61b1]
  - @mocktomata/framework@7.0.0-beta.13
  - @mocktomata/nodejs@7.0.0-beta.13

## 7.0.0-beta.12

### Patch Changes

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
  - @mocktomata/nodejs@7.0.0-beta.12

## 7.0.0-beta.11

### Patch Changes

- 424b643: Update `boom` to `@hapi/boom`
  - @mocktomata/framework@7.0.0-beta.11
  - @mocktomata/io-fs@7.0.0-beta.11

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 7.0.0-beta.10 (2022-08-06)

**Note:** Version bump only for package @mocktomata/file-server

# 7.0.0-beta.9 (2022-08-06)

**Note:** Version bump only for package @mocktomata/file-server

# 7.0.0-beta.8 (2022-08-06)

**Note:** Version bump only for package @mocktomata/file-server

# 7.0.0-beta.7 (2021-09-04)

### Bug Fixes

- old/spec/package.json to reduce vulnerabilities ([#311](https://github.com/mocktomata/mocktomata/issues/311)) ([d8cc30f](https://github.com/mocktomata/mocktomata/commit/d8cc30fa1f9e678757b4c00333b527d4e2a8d93e))

# 7.0.0-beta.6 (2021-06-08)

**Note:** Version bump only for package @mocktomata/file-server

# 7.0.0-beta.5 (2020-05-01)

**Note:** Version bump only for package @mocktomata/file-server

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

**Note:** Version bump only for package @mocktomata/file-server

# 7.0.0-beta.0 (2020-03-23)

### Bug Fixes

- change ignoreMismatch implementation ([0719468](https://github.com/mocktomata/mocktomata/commit/0719468137bd42c017eea5b330c51363d7538a04))
- downgrade hapi to 18 for Node 10 ([b6db4ff](https://github.com/mocktomata/mocktomata/commit/b6db4ffe4ef54eaaa1c0f9eaa9d8ccac18b8fbf3))
- remove plugins from info ([cac39cc](https://github.com/mocktomata/mocktomata/commit/cac39cc31b5c17a88c00e1350d3ca34335b6b453))
- set null ([75530cd](https://github.com/mocktomata/mocktomata/commit/75530cdccf2dcb6640c03300b7b23ea65aa14f3c))
- **file-server:** do not cache config ([1cecc22](https://github.com/mocktomata/mocktomata/commit/1cecc224decbb219266c455488b46bc8004425c3))
- **file-server:** expose start types ([ae1bafc](https://github.com/mocktomata/mocktomata/commit/ae1bafc1f1a18db8e9759dfb7454131c3a61a69f))
- **file-server:** remove context ([7d15eb6](https://github.com/mocktomata/mocktomata/commit/7d15eb60a21385d9c80a4f68072ec539b72701f1))
- **io-fs:** expose only FileRepository ([3c1200e](https://github.com/mocktomata/mocktomata/commit/3c1200e9b07faa42eea2e285a2210ae626cce16b))
- **io-fs:** throws PluginNotFound ([162012f](https://github.com/mocktomata/mocktomata/commit/162012fa2e9a88386f2d33258a3defc58e194aae))
- update clibuilder ([03cd954](https://github.com/mocktomata/mocktomata/commit/03cd954e171d9cfd2f7697ebaeae0058d03fc95a))
- upgrade to global-store@beta ([ce8f869](https://github.com/mocktomata/mocktomata/commit/ce8f8693930108656403e57984d00597573b74ac))

### Features

- add invokePath to spec ([b0f3c3f](https://github.com/mocktomata/mocktomata/commit/b0f3c3f29f19e540af927cc91c541c0f4b7e1f8f))
- expose startServer() ([ae47ef5](https://github.com/mocktomata/mocktomata/commit/ae47ef5d80672a2bb307937ba3fa472f2f62a328))
- further remove all mention of komondor ([7cac8fe](https://github.com/mocktomata/mocktomata/commit/7cac8febdd247fcc26ed630795f220c9d553eb00))
- move file-server to moctomata ([3e76e92](https://github.com/mocktomata/mocktomata/commit/3e76e921ccf1e02796edb9c89dcdcdf7f7db5fcf))
- move io-fs to moctomata ([68a9add](https://github.com/mocktomata/mocktomata/commit/68a9add3e79c73c80ec5b771ac3048df8a70c001))
- remove scenario ([a2d0a1e](https://github.com/mocktomata/mocktomata/commit/a2d0a1e8d6d8607ab37c46dc9895b2973a023cc0))
- rename getSpy|Stub to createSpyStub ([4323d6f](https://github.com/mocktomata/mocktomata/commit/4323d6fcb8f458aefa084445e5e4e6140497620b))
- rename to mocktomata ([17ffe41](https://github.com/mocktomata/mocktomata/commit/17ffe41eec572337ce683fd4cdb613a3d6394e19))
- **file-server:** expose repository for override during test ([cadfb64](https://github.com/mocktomata/mocktomata/commit/cadfb64796fd27e2e8e9061a090ea0c2ec856d80))
- **file-server:** remove cli ([27f863b](https://github.com/mocktomata/mocktomata/commit/27f863b535240b05629f766c6b62f71ce051db00))
- **file-server:** rename and update io-server to file-server ([eae327e](https://github.com/mocktomata/mocktomata/commit/eae327e64965eab75eca3ebd546b062e841c57a1))
- **file-server:** rewrite ([d9e7975](https://github.com/mocktomata/mocktomata/commit/d9e797534a5696c0a6e00c4ae92a234f438e39b2))
- **file-server:** use Repository from io-fs ([8072a65](https://github.com/mocktomata/mocktomata/commit/8072a652bd9854138c9578da16abf36b6d16bea3))
