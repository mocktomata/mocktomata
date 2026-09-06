# @mocktomata/cli

## 10.0.0

### Major Changes

- 66fdf25: ESM only. The CommonJS build is removed.

  Every package now ships `esm/` (`lib/` for `@mocktomata/cli`) and nothing else. The `cjs/`
  directory, the `cjs/package.json` `{"type":"commonjs"}` marker and the `main` field are gone, and
  `exports` lists ESM entries only. mocktomata is a testing library, so its consumers are test
  suites, which have not needed `require()` for some time.

  What a `require()` of these packages does now depends on the Node version, and both outcomes were
  verified against the packed tarballs rather than assumed:

  - **Node < 22.12** — `require()` throws `ERR_REQUIRE_ESM` with Node's own message pointing at
    `import()`. A clean, actionable failure.
  - **Node >= 22.12** — Node's built-in `require(esm)` loads the package and returns the complete
    namespace. Every export is present and callable.

  The `default` condition still points at the ESM entry, so that second path keeps working. Dropping
  it would force a hard `ERR_PACKAGE_PATH_NOT_EXPORTED` on modern Node for no benefit; the module
  graph is genuinely ESM either way.

  Also in this release:

  - `engines.node` is now `>= 20`, the floor an ESM-only package can honestly claim.
  - `@mocktomata/cli` no longer depends on `uni-require`. It read its own `package.json` through a
    `createRequire` shim built from _that package's_ `import.meta.url`, so the specifier resolved
    against `uni-require`'s own directory and `mt --version` reported `1.0.0`. It now resolves the
    manifest from `import.meta.url` and reports the CLI's version.
  - `@mocktomata/framework` declares `standard-log-color` as a dependency. Two of its modules import
    it, but it was listed under `devDependencies`, so the published package relied on a consumer
    happening to hoist it.
  - `@mocktomata/service` renames the internal `jest` module to `test_server`. It was never part of
    `exports`; `@mocktomata/service/testing` is unchanged.
  - `@mocktomata/nodejs` no longer publishes `esm/testutils/fixture.js`. It resolves `../../fixtures`,
    a directory the tarball has never contained, and it is reachable from no `exports` path.

### Patch Changes

- Updated dependencies [66fdf25]
  - @mocktomata/service@10.0.0

## 9.2.4

### Patch Changes

- Updated dependencies [0f3de8f]
  - @mocktomata/service@9.2.4

## 9.2.3

### Patch Changes

- Updated dependencies [42f30357]
  - @mocktomata/service@9.2.3

## 9.2.2

### Patch Changes

- @mocktomata/service@9.2.2

## 9.2.1

### Patch Changes

- @mocktomata/service@9.2.1

## 9.2.0

### Patch Changes

- 85390511: Update docs
  - @mocktomata/service@9.2.0

## 9.1.2

### Patch Changes

- @mocktomata/service@9.1.2

## 9.1.1

### Patch Changes

- @mocktomata/service@9.1.1

## 9.1.0

### Patch Changes

- @mocktomata/service@9.1.0

## 9.0.2

### Patch Changes

- @mocktomata/service@9.0.2

## 9.0.1

### Patch Changes

- @mocktomata/service@9.0.1

## 9.0.0

### Patch Changes

- d04470e0: Update port to 3689 as it used to be.
- c7458885: Fix ESM usage.

  The path resolution of `uni-require` might have some problem.
  Will fix if needed.

- Updated dependencies [d04470e0]
- Updated dependencies [6cce9bab]
- Updated dependencies [60102758]
  - @mocktomata/service@9.0.0

## 8.0.5

### Patch Changes

- 5c26ae0f: Update `clibuilder`
  - @mocktomata/service@8.0.5

## 8.0.4

### Patch Changes

- @mocktomata/service@8.0.4

## 8.0.3

### Patch Changes

- @mocktomata/service@8.0.3

## 8.0.2

### Patch Changes

- @mocktomata/service@8.0.2

## 8.0.1

### Patch Changes

- @mocktomata/service@8.0.1

## 8.0.0

### Minor Changes

- f884ee26: Adjust `main`, `exports`, and `files` fields.
- f884ee26: Rename alias `mtmt` to `mt`

### Patch Changes

- Updated dependencies [f884ee26]
  - @mocktomata/service@8.0.0

## 7.2.0

### Patch Changes

- @mocktomata/service@7.2.0

## 7.1.1

### Patch Changes

- Updated dependencies [daf55a94]
  - @mocktomata/service@7.1.1

## 7.1.0

### Patch Changes

- @mocktomata/service@7.1.0

## 7.0.8

### Patch Changes

- @mocktomata/service@7.0.8

## 7.0.7

### Patch Changes

- @mocktomata/service@7.0.7

## 7.0.6

### Patch Changes

- @mocktomata/service@7.0.6

## 7.0.5

### Patch Changes

- @mocktomata/service@7.0.5

## 7.0.4

### Patch Changes

- @mocktomata/service@7.0.4

## 7.0.3

### Patch Changes

- @mocktomata/service@7.0.3

## 7.0.2

### Patch Changes

- @mocktomata/service@7.0.2

## 7.0.1

### Patch Changes

- @mocktomata/service@7.0.1

## 7.0.0

### Patch Changes

- b73a048: Move cli code to `@mocktomata/cli`
- 05127fd: re-release. try to fix the nodejs issue
- Updated dependencies [424b643]
- Updated dependencies [24b61b1]
- Updated dependencies [93e654c]
- Updated dependencies [6dd32fb]
- Updated dependencies [05127fd]
  - @mocktomata/service@7.0.0

## 7.0.0-beta.17

### Patch Changes

- @mocktomata/service@7.0.0-beta.17

## 7.0.0-beta.16

### Patch Changes

- re-release. try to fix the nodejs issue
- Updated dependencies
  - @mocktomata/service@7.0.0-beta.16

## 7.0.0-beta.15

### Patch Changes

- @mocktomata/service@7.0.0-beta.15

## 7.0.0-beta.14

### Patch Changes

- re-release
- Updated dependencies
  - @mocktomata/service@7.0.0-beta.14

## 7.0.0-beta.13

### Patch Changes

- Updated dependencies [24b61b1]
  - @mocktomata/service@7.0.0-beta.13

## 7.0.0-beta.12

### Patch Changes

- b73a048: Move cli code to `@mocktomata/cli`
- Updated dependencies [93e654c]
- Updated dependencies [6dd32fb]
  - @mocktomata/service@7.0.0-beta.12
