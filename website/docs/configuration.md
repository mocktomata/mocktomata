# Configuration

There are three ways to configure `mocktomata`.

Each way has its own application.
Also, since `mocktomata` can run in multiple environments,
the configuration may vary depending on the environment.
(the variation will be added in the future)

- [Configuration](#configuration)
  - [Configuration File](#configuration-file)
  - [Using `config()`](#using-config)
  - [Environment Variables](#environment-variables)
  - [Tips and Tricks](#tips-and-tricks)
    - [Define plugins in configuration file](#define-plugins-in-configuration-file)
    - [Change mode using `config()` function](#change-mode-using-config-function)
    - [Use Environment Variables in CI](#use-environment-variables-in-ci)
    - [Acceptance Tests](#acceptance-tests)
    - [Refresh Records](#refresh-records)
    - [Detect Stale Records](#detect-stale-records)

## Configuration File

`mocktomata` will look for `.mocktomata.js`, `.mocktomata.json`, or the `mocktomata` section inside `package.json`.

Only one of them should be used at a time.
If more than one configuration are found,
it will throw a `AmbiguousConfig` error.

Using `.mocktomata.json` as an example,
here is what can be configured and their default values:

```json
{
  // Overrides which mode `mockto()` runs in.
  // By default `mockto()` runs in auto mode.
  "overrideMode": "<live | save | simulate>",
  // Filter which `mockto()` mode to override by file path.
  "filePathFilter": "<regex>",
  // Filter which `mockto()` mode to override by spec name.
  "specNameFilter": "<regex>",
  // A list of plugins to use.
  "plugins": ["plugin-a"]
}
```

## Using `config()`

Configuration can also be overridden in the runtime using the `config()` function.
This is useful when the configuration is stored in different means (e.g. database or remote service),
or used during test startup or test runner plugins (e.g. jest watch plugins) so that the test process do not need to be restarted and do not need to manually change the configuration files.

```js
import { config } from 'mocktomata'

config({
  overrideMode: "<live | save | simulate>",
  filePathFilter: "<regex>",
  specNameFilter: "<regex>",
  plugins: ["plugin-a"],
  // currently only debug level is available
  logLevel: 'debug'
})
```

## Environment Variables

Specific configuration can be overridden using environment variables.
This allows different CI jobs to run `mocktomata` with different configuration.

The names are:

- `MOCKTOMATA_MODE`
- `MOCKTOMATA_FILE_FILTER`
- `MOCKTOMATA_SPEC_FILTER`
- `MOCKTOMATA_LOG`

## Tips and Tricks

Each configuration mechanism provided is designed for a specific purpose.
By using these mechanisms with their intended usage,
it would be easier for you to configure [`mocktomata`](../README.md) to your specific needs.

### Define plugins in configuration file

This is kind of a no-brainer.
If your library/application supports multiple environments and requires different plugins,
use `.mocktomata.js` so that you can use different plugins if needed.

### Change mode using `config()` function

While you can do the same with environment variable,
calling `config()` in a test setup file is much easier and faster.

Especially when you try to flip tests quickly.

### Use Environment Variables in CI

Environment variable based configuration is designed for CI usage.

### Acceptance Tests

Turn your tests into acceptance tests by running tests with `overrideMode = 'live'`.

### Refresh Records

You can easily refresh all records by running tests with `overrideMode = 'save'`.

### Detect Stale Records

(To be implemented)
