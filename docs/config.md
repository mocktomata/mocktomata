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
  // This applies to the server and when running in NodeJS, electron.
  "fs": {
    "folder": ".mocktomata"
  },
  "service": {
    // When specified, server will run on this port (or the next one available, up to port + 10).
    // client need to configure the same using `config()`
    "port": 3698
  },
  "spec": {
    // Specify the mode used by `mockto()`
    "mode": "auto",
    "filename": "<regex for file-name>",
    "specname": "<regex for spec-name>",
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

})
```

The `mocktomata` configuration is different depends on whether it is used in the browser or in NodeJS.

## Config for browser usage

```json
{
  // the port used by the `@mocktomata/file-server`
  "port": 3698,
  "spec": {
    //
    "filter": []
  }
}
```
