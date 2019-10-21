# Config

There are several ways to configure `mocktomata`.
Each way has its own application thus what can be configured varies.
Also, since `mocktomata` can run in different environments,
the configuration may be used differently and applied in certain way.

### Configuration File

`mocktomata` will look for `.mocktomata.js`, `.mocktomata.json`, and the `mocktomata` section inside `package.json`.

If more than one configurations is found,
the configurations are merged,
and each configuration section is overridden in the following order:

- `mocktomata` section inside `package.json`, overridden by
- `.mocktomata.json`, overridden by
- `.mocktomata.js`

Using `.mocktomata.json` as an example,
here is what can be configured and their default values:

```json
{
  // Controls how the files are saved locally.
  // Specify the root folder for all `mocktomata` data.
  // Note that you should check in this file in your source control.
  "folder": ".mocktomata",
  // Optional. The list of plugins used by `mocktomata`.
  // If not specified, `mocktomata` will check all dependncies specified in `package.json` for installed plugins.
  // If there are conflicts between plugins and you need the plugins to load in certain order,
  // you must use this to specify them.
  "plugins": ["plugin-a"],
  "specOptions": {
    // Overrides which mode `mockto()` runs in.
    // By default `mockto()` runs in auto mode.
    "mode": "[live | save | simulate]",
    // Filter which `mockto()` mode to override by file name.
    "fileName": "[regex for file-name]",
    // Filter which `mockto()` mode to override by spec name.
    "specName": "[regex for spec-name]",
  },
  // Options for local file server serving `mocktomata` running in the browser.
  "serverOptions": {
    // When specified, server will run on this port.
    // client need to configure the same using `config()`
    "port": 3698
  }
}
```

### Environment Variables

Specific configuration can be overridden using environment variables.
This allow different CI job to run `mocktomata` with different configuration.

The configurations are limited,
but will be expended as needed.

- `MOCKTOMATA_SPEC_MODE`: instruct `mockto(...)` to run in specific mode.

### Using `config()`

Configuration can also be overridden in runtime using the `config` object.
This is useful when the configuration is stored in different means (e.g. database or remote service),
or used during test startup or test runner plugins (e.g. jest watch plugins) so that the test process do not need to be restarted and do not need to manually change the configuration files.

```js
import { config } from 'mocktomata'

config({
  // configuration only apply when running in the browser.
  "client": {
    // Optional. Server URL.
    // default to `http(s)://localhost:3698` and will try the next 10 ports up to 3707
    "url": "<server url>"
  },
  // this only apply when running in NodeJS
  "fs": {
    "folder": ".mocktomata"
  },
  "service": {
    // this only apply when runnign in browser
    "port": 3698
  },
  "spec": {
    // Specify the mode used by `mockto()`
    "mode": "auto",
    "filename": "<regex for file-name>",
    "specname": "<regex for spec-name>",
  }
})
```
