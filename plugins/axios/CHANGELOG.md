# @mocktomata/plugin-axios

## 3.0.0

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
  - mocktomata@10.0.0

## 2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies [42f30357]
- Updated dependencies [3d0784c3]
  - mocktomata@9.2.3

## 2.0.2

### Patch Changes

- Updated dependencies [98b38dbf]
  - mocktomata@9.2.2

## 2.0.1

### Patch Changes

- Updated dependencies [39b9c9ec]
  - mocktomata@9.2.1

## 2.0.0

### Patch Changes

- Updated dependencies [2d567309]
  - mocktomata@9.2.0

## 1.0.4

### Patch Changes

- mocktomata@9.1.2

## 1.0.3

### Patch Changes

- acb1bbd1: Revert last change. It is actually not needed.

## 1.0.2

### Patch Changes

- b012c96b: Add dummy header inside the interceptors

## 1.0.1

### Patch Changes

- mocktomata@9.1.1

## 1.0.0

### Major Changes

- 39f30fbc: Initial release.

### Patch Changes

- Updated dependencies [39f30fbc]
  - mocktomata@9.1.0
