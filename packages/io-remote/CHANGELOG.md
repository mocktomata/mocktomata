# Change Log

## 7.1.0

### Patch Changes

- Updated dependencies [1b8a98a4]
  - @mocktomata/framework@7.1.0

## 7.0.8

### Patch Changes

- Updated dependencies [68985c0f]
  - @mocktomata/framework@7.0.8

## 7.0.7

### Patch Changes

- Updated dependencies [d5104f51]
  - @mocktomata/framework@7.0.7

## 7.0.6

### Patch Changes

- Updated dependencies [7c455dd1]
- Updated dependencies [7953176a]
  - @mocktomata/framework@7.0.6

## 7.0.5

### Patch Changes

- Updated dependencies [b45c312a]
  - @mocktomata/framework@7.0.5

## 7.0.4

### Patch Changes

- Updated dependencies [91273a1a]
  - @mocktomata/framework@7.0.4

## 7.0.3

### Patch Changes

- @mocktomata/framework@7.0.3

## 7.0.2

### Patch Changes

- Updated dependencies [1dcffc11]
  - @mocktomata/framework@7.0.2

## 7.0.1

### Patch Changes

- Updated dependencies [45ec7c32]
- Updated dependencies [df914861]
  - @mocktomata/framework@7.0.1

## 7.0.0

### Patch Changes

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

## 7.0.0-beta.17

### Patch Changes

- Updated dependencies [4b4501e]
- Updated dependencies [47f1174]
  - @mocktomata/framework@7.0.0-beta.17

## 7.0.0-beta.16

### Patch Changes

- re-release. try to fix the nodejs issue
- Updated dependencies
  - @mocktomata/framework@7.0.0-beta.16

## 7.0.0-beta.15

### Patch Changes

- Updated dependencies [9d332a9]
  - @mocktomata/framework@7.0.0-beta.15

## 7.0.0-beta.14

### Patch Changes

- re-release
- Updated dependencies
  - @mocktomata/framework@7.0.0-beta.14

## 7.0.0-beta.13

### Patch Changes

- 24b61b1: Distribute CJS.
  There are dependencies still on in ESM,
  so forcing ESM only means tools like `jest` need to go through a lot to get things working.
- Updated dependencies [24b61b1]
  - @mocktomata/framework@7.0.0-beta.13

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

## 7.0.0-beta.11

### Patch Changes

- @mocktomata/framework@7.0.0-beta.11

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 7.0.0-beta.10 (2022-08-06)

**Note:** Version bump only for package @mocktomata/io-client

# 7.0.0-beta.9 (2022-08-06)

**Note:** Version bump only for package @mocktomata/io-client

# 7.0.0-beta.8 (2022-08-06)

**Note:** Version bump only for package @mocktomata/io-client

# 7.0.0-beta.7 (2021-09-04)

### Bug Fixes

- old/spec/package.json to reduce vulnerabilities ([#311](https://github.com/mocktomata/mocktomata/issues/311)) ([d8cc30f](https://github.com/mocktomata/mocktomata/commit/d8cc30fa1f9e678757b4c00333b527d4e2a8d93e))

# 7.0.0-beta.6 (2021-06-08)

**Note:** Version bump only for package @mocktomata/io-client

# 7.0.0-beta.5 (2020-05-01)

**Note:** Version bump only for package @mocktomata/io-client

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

**Note:** Version bump only for package @mocktomata/io-client

# 7.0.0-beta.0 (2020-03-23)

### Bug Fixes

- adjust getConfig() ([0c53322](https://github.com/mocktomata/mocktomata/commit/0c53322a78566f274d0327f121e2b42c31e7098c))
- remove store from framework ([7bd9ab9](https://github.com/mocktomata/mocktomata/commit/7bd9ab95c535daca823684750146c2a9a1b0fc08))
- update deps ([c9b3f34](https://github.com/mocktomata/mocktomata/commit/c9b3f3400e887b13271179efd3dbdca70fc899e6))
- **file-server:** remove context ([7d15eb6](https://github.com/mocktomata/mocktomata/commit/7d15eb60a21385d9c80a4f68072ec539b72701f1))
- **io-client:** exposrt error classes ([b2d1f44](https://github.com/mocktomata/mocktomata/commit/b2d1f4442053efe6c4c64a306d0f60126d3ac110))
- **io-client:** fix types ([3aeac94](https://github.com/mocktomata/mocktomata/commit/3aeac940516cd5ba30d2e55c302768028549fee6))
- **io-client:** hide ServerInfo type. ([bf38aac](https://github.com/mocktomata/mocktomata/commit/bf38aac71e8d30fc8d852c9dd8c2feb27cd1d582))

### Features

- add createIncubator() ([18b96b2](https://github.com/mocktomata/mocktomata/commit/18b96b265b5b21fe7dadbe85320ccc6070f19789))
- **io-client:** implement getSpecConfig() ([b3be5a6](https://github.com/mocktomata/mocktomata/commit/b3be5a6806ee6e2fd746781f195ac82b17913860))
- add invokePath to spec ([b0f3c3f](https://github.com/mocktomata/mocktomata/commit/b0f3c3f29f19e540af927cc91c541c0f4b7e1f8f))
- add value support ([c342c58](https://github.com/mocktomata/mocktomata/commit/c342c58c404bf1eee012bcea7c30aea3c63190da))
- change io-fs to expose createSpecIO and createScenarioIO instead ([b7ff2e1](https://github.com/mocktomata/mocktomata/commit/b7ff2e16fcd99702b8839ebbc2f8b8dfcf40cd0e))
- further remove all mention of komondor ([7cac8fe](https://github.com/mocktomata/mocktomata/commit/7cac8febdd247fcc26ed630795f220c9d553eb00))
- move file-server to moctomata ([3e76e92](https://github.com/mocktomata/mocktomata/commit/3e76e921ccf1e02796edb9c89dcdcdf7f7db5fcf))
- move io-fs to moctomata ([68a9add](https://github.com/mocktomata/mocktomata/commit/68a9add3e79c73c80ec5b771ac3048df8a70c001))
- move loadConfig to io-fs ([2f77c10](https://github.com/mocktomata/mocktomata/commit/2f77c10b6dbd1320b24b6164b32125ccf65ae807))
- move mockto to mocktomata ([67b23ea](https://github.com/mocktomata/mocktomata/commit/67b23ea9273e60a5b1dd93c6b478972015eff8a8))
- remove scenario ([a2d0a1e](https://github.com/mocktomata/mocktomata/commit/a2d0a1e8d6d8607ab37c46dc9895b2973a023cc0))
- rename core to framework ([e9c4666](https://github.com/mocktomata/mocktomata/commit/e9c4666a6e2ae75985b5a931e6f5136ee94cb54c))
- rename getSpy|Stub to createSpyStub ([4323d6f](https://github.com/mocktomata/mocktomata/commit/4323d6fcb8f458aefa084445e5e4e6140497620b))
- rename spec to mockto ([60a4a14](https://github.com/mocktomata/mocktomata/commit/60a4a14f06e3590a6b587e2648fe3bfae3fa978e))
- rename to mocktomata ([17ffe41](https://github.com/mocktomata/mocktomata/commit/17ffe41eec572337ce683fd4cdb613a3d6394e19))
- **io-client:** rewrite ([21f9f0b](https://github.com/mocktomata/mocktomata/commit/21f9f0b98b6d3e9349c74d26fc30bf6a95cb87a7))
- **io-client:** update project ([70d2a04](https://github.com/mocktomata/mocktomata/commit/70d2a0425da42af4b19d33a7119d0f070a1a790a))
