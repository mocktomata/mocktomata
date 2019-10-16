# Dependency Map

This file shows the relationship between various `komondor` packages

- komondor
  - komondor-config


## Main libraries

- `komondor` is the application package. User installs `komondor` for normal usage. It supports multiple platforms usage, including NodeJS, browser, Electron and others.
  - If needed, we can break each platform usage into separate packages, such XDCV5 T66W `komondor-electron`, `komondor-browser`, `komondor-chrome`, etc. Depending on how complex it is in supporting multiple platforms.
  - More complex cases are IOS and Android, etc.
  - Application acceptance tests should be done at this level.
- `komondor-cli`
- `@mocktomata/framework` contains the core logic of `komondor`.
  - It should not depends on lower level detail packages, such as `io-local`.
  - Since it should not depends on other packages, include the specific plugins (this could cause circular reference in TypeScript compiler, causing many problems),
  - that's why acceptance tests is done at top level (`komondor`)
- `io-local` is the IO package implementing the `KomondorIO` interface for local IO usage.
  - This is used by platform like NodeJS and Electron.
- `io-client` is the IO package implementing the `KomondorIO` interface for browser IO usage.
- `io-server` is a server library supporting `io-client`.
- `plugin` contains plugin related logic. It does not depend on lower level details.
- `dev-cli` is a cli tool for developing plugins.
  - For the time being this is expected to be included in the `komondor` app itself.
