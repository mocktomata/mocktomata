# incubator

This is the user manual for `incubator`.

`incubator` is primary used to develop [`plugin`](./plugin.md).

## `incubator.setup()`

## `incubator.duo(specName, (title, spec) => void)`

This is the basic usage of `incubator`.

It will call the handler (`(title, spec) => void`) twice.
First in `save` mode, second in `simulate` mode.

This make sure the plugin supports the test scenario correctly.
