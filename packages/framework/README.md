# @moctomata/framework

Framework of [`moctomata`](https://www.npmjs.com/package/moctomata).

In normal circumstances,
you should use the main module [`moctomata`](https://www.npmjs.com/package/moctomata).

You only need to use this directly if you are developing a plugin.

This module exposes an `incubator` for writing plugin,
which is not exposed in [`moctomata`](https://www.npmjs.com/package/moctomata).

## Installation

```sh
npm install -D @moctomata/framework
// or
yarn add -D @moctomata/framework
```

## Usage

When writing plugins,
you can use the types provided by the library to help making it easier.

```ts
// index.ts
import { SpecPluginActivationContext } from '@moctomata/framework`
import { yourPlugin } from './yourPlugin'

export function activate(context: SpecPluginActivationContext) {
  context.register(yourPlugin)
}

// yourPlugin.ts
import { SpecPlugin } from '@moctomata/framework'

export const yourPlugin: SpecPlugin<YourSubject, YourMeta> = {
  name: 'your-plugin',
  support: subject => isYourSubject(subject),
  createSpy: (context, subject) => ...,
  createStub: (context, subject, meta) => ...,
}
```

You can use `incubator` to help writing tests for your plugin.

```ts
// yourPlugin.spec.ts
import { es2015, incubator, loadPlugins, TestHarness } from '@moctomata/framework`
import { yourPlugin } from './yourPlugin'

let harness: TestHarness
beforeAll(async () => {
  harness = incubator.createTestHarness({ target: 'es2015' })
  harness.addPluginModule('your-plugin', yourPlugin)
  await harness.start()
})

incubator.duo('your plugin test', (title, spec) => {
  test(title, async () => {
    const mockedSubject = spec.mock(yourSubject)
    ...
    await spec.done()
  })
})
```
