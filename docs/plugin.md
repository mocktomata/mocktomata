# plugin

[`mocktomata`][mocktomata] is built with a plugin architecture.
In fact, every language level behavior are simple plugins.

It works out-of-the-box most of the time.
But if you use certain library that does not work with [`mocktomata`][mocktomata],
you can write a plugin for that library.

## PluginModule

A `PluginModule` is a package that contains one or more plugins.

For a package to be considered as a `PluginModule`,
it needs to have two things:

- add `mocktomata-plugin` in its `package.json` `keywords` list
- export a `activate()` function with the following signature:

```ts
import { SpecPlugin } from 'mocktomata'

export function activate(context: SpecPlugin.ActivationContext) {
  context.register('your-plugin', yourPlugin)
}

const yourPlugin: SpecPlugin = ...
```

## SpecPlugin

`SpecPlugin` defines the interface of the plugin.

```ts
export type SpecPlugin<S = any, M = any> = {
  /**
   * Name of the plugin. This is needed only if there are multiple plugins in a package.
   */
  name?: string,
  /**
   * Indicates if the plugin can handle the specified subject.
   */
  support(subject: any): boolean,
  /**
   * Creates a spy that captures the interactions with the specified subject.
   * @param context Provides tools needed to record the subject's behavior.
   * @param subject The subject to spy.
   */
  createSpy(context: SpecPlugin.SpyContext<M>, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: SpecPlugin.StubContext, subject: S, meta: M): S,
}
```

## Using `incubator`

When writing plugin, you can use [`incubator`][incubator] to test your plugin.

[mocktomata]: https://github.com/mocktomata/mocktomata/blob/master/packages/mocktomata
[incubator]: https://github.com/mocktomata/mocktomata/blob/master/docs/incubator.md
