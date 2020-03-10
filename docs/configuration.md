# Configuration

- [Configuration](#configuration)
  - [Configuration File](#configuration-file)
  - [Using `config()`](#using-config)
  - [Environment Variables](#environment-variables)
  - [Tips and Tricks](#tips-and-tricks)

There are three ways to configure `mocktomata`.

Each way has its own application.
Also, since `mocktomata` can run in multiple environments,
the configuration may be varies depending on the environment.
(the variation will be added in the future)

## Configuration File

`mocktomata` will look for `.mocktomata.js`, `.mocktomata.json`, or the `mocktomata` section inside `package.json`.

Only one of them should be used at a time.
If more than one configurations is found,
it will throws an `AmbiguousConfig` error.

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

Configuration can also be overridden in the runtime using the `config` function.
This is useful when the configuration is stored in different means (e.g. database or remote service),
or used during test startup or test runner plugins (e.g. jest watch plugins) so that the test process do not need to be restarted and do not need to manually change the configuration files.

```js
import { config } from 'mocktomata'

config({
  mode: "<live | save | simulate>",
  filePathFilter: "<regex>",
  specNameFilter: "<regex>",
  plugins: ["plugin-a"],
  // currently only debug level is available
  logLevel: 'debug'
})
```

## Environment Variables

Specific configuration can be overridden using environment variables.
This allow different CI job to run `mocktomata` with different configuration.

The names are:

- `MOCKTOMATA_MODE`
- `MOCKTOMATA_FILE_FILTER`
- `MOCKTOMATA_SPEC_FILTER`
- `MOCKTOMATA_LOG`

## Tips and Tricks
