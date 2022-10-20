# `@mocktomata/nodejs`

`@mocktomata/nodejs` provides detail implementations specific to NodeJS.

Currently, it contains code to validate the data (config, plugin, env, etc.).
They should be moved out so those logics can be used on both client and server side.

Ultimately, the interface of this package should be generic, i.e. `Record<any, unknown>`, instead of specific (e.g. `Mocktomata.ConfigInput`).

It should strive to be as thin as possible., containing no logic at all.
