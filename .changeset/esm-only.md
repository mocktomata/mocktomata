---
'@mocktomata/plugin-axios': major
'@mocktomata/framework': major
'@mocktomata/io-remote': major
'@mocktomata/service': major
'@mocktomata/nodejs': major
'@mocktomata/cli': major
'mocktomata': major
---

ESM only. The CommonJS build is removed.

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
  `createRequire` shim built from *that package's* `import.meta.url`, so the specifier resolved
  against `uni-require`'s own directory and `mt --version` reported `1.0.0`. It now resolves the
  manifest from `import.meta.url` and reports the CLI's version.
- `@mocktomata/framework` declares `standard-log-color` as a dependency. Two of its modules import
  it, but it was listed under `devDependencies`, so the published package relied on a consumer
  happening to hoist it.
- `@mocktomata/service` renames the internal `jest` module to `test_server`. It was never part of
  `exports`; `@mocktomata/service/testing` is unchanged.
- `@mocktomata/nodejs` no longer publishes `esm/testutils/fixture.js`. It resolves `../../fixtures`,
  a directory the tarball has never contained, and it is reachable from no `exports` path.
