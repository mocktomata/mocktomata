# incubator

This is the user manual for `incubator`.

`incubator` is primary used to develop [`plugin`](./plugin.md).

- [incubator](#incubator)
  - [`incubator.config()`](#incubatorconfig)
  - [`incubator.duo(specName, (title, spec) => void)`](#incubatorduospecname-title-spec--void)
  - [`incubator.sequence(specName, (title, { save, simulate }) => void)`](#incubatorsequencespecname-title--save-simulate---void)

## `incubator.config()`

Configure the `incubator`.
This function's signature is identical to the configuation function [`config()`](./configuration.md#using-config).

The general configuration mechanism does not affect `incubator`.

## `incubator.duo(specName, (title, spec) => void)`

This is the basic usage of `incubator`.

It will call the handler (`(title, spec) => void`) twice.
First in `save` mode, second in `simulate` mode.

This make sure the plugin supports the test scenario correctly.

## `incubator.sequence(specName, (title, { save, simulate }) => void)`

Allow you to run `spec` in `save` mode and in `simulate` mode sequentially.
This is useful for writing negative tests for plugins.
