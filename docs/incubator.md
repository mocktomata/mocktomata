# `incubator`

This is the user manual for `incubator`.

`incubator` is primary used to develop [`plugin`](./plugin.md).

- [`incubator`](#incubator)
  - [`incubator.config()`](#incubatorconfig)
  - [`incubator(specName, (specName, spec) => void)`](#incubatorspecname-specname-spec--void)
  - [`incubator.sequence(specName, (specName, { save, simulate }) => void)`](#incubatorsequencespecname-specname--save-simulate---void)

## `incubator.config()`

To use the `incubator`, you need to call `incubator.config()` to add your plugin to the system.

```ts
import { incubator } from 'mocktomata'
import { activate } from '.'

beforeAll(() => incubator.config({ plugins: [
  'other-plugin-a',
  ['your-plugin', activate],
  'other-plugin-b'
]}))
```

`activate` is the activate function you export (`function activate(context: SpecPlugin.ActivationContext): any`).

As shown in the example above, you can load other plugins to create a specific test environment.

Note that the general configuration mechanism does not affect `incubator`.

## `incubator(specName, (specName, spec) => void)`

This is the basic usage of `incubator`.

It will call the handler (`(specName, spec) => void`) twice.
First in `save` mode, second in `simulate` mode.

This make sure the plugin supports the test scenario correctly.

## `incubator.sequence(specName, (specName, { save, simulate }) => void)`

Allow you to run `spec` in `save` mode and in `simulate` mode sequentially.
This is useful for writing negative tests for plugins.
