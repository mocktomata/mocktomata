# Creating Komondor Plugins

Komondor plugins add support to packages, classes, or specific construct that is not supported by the build-in mechanism.

To create a plugin, you need to export a `activate()` function as follow:

```ts
import { Registrar } from 'komondor-plugin'

export function activate(registrar: Registrar) {
  registrar.register(
    'function',
    subject => typeof subject === 'function',
    (context, subject) => { /* spy implementation */ },
    (context, subject, action) => { /* stub implementation */ })
}
```

The `Spy` is used to record the actions performed,
while the `Stub` is used to replay the actions recorded.

## API

### Registrar.register(name, support, getSpy, getStub)

Register a plugin.

#### name: string

Name of the plugin.

The name should be unique.
If consumer loads two plugins with the same name, an error will be thrown.

This name should be used as the scope name of your actions.
For example, if your plugin is `node` which as `childProcess` and `stream`,
then your action types should be `node/childProcess`, `node/stream`, etc.

#### support: subject => boolean

A predicate to determine if the plugin supports the `subject`.

For example, for the generic `function` plugin,
the predicate is `subject => typeof subject === 'function'`.

#### getSpy: (context, subject) => spiedSubject

Creates a spied subject.

#### getStub: (context, subject) => stubbedSubject

Creates a stubbed subject.

## tsconfig.json

Since the `activate()` function takes an argument of `Registerar` and this interface comes from `komondor`,
i
Set `declaration` to false.

## Helper

When writing your plugin, you can consider using [`komondor-test`](https://github.com/unional/komondor-test) to help testing your plugin.

When testing your plugin,
you can use `speced.satisfy([...])` instead of `speced.done()` to ensure the actions are recorded properly.
