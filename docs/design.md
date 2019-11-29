# Design

## Subject Profiles

Subject profile descibes the behavior of the subject.

`target` is the spec target, including its derivatives.

- source: input
- type: stub
- actions
  - get: `user`
    - result: `target`
  - invoke: `user`
    - arguments: `input`
    - result: `output`
  - instantiate: `user`
    - arguments: `input`
    - result: `output`

`input` are inputs comes from the user.
For example, arguments when invoking functions,
or return values of callbacks.

- source: input
- type: spy
- actions
  - get: `mockto`
    - result: `input`
  - invoke: `mockto`
    - arguments: `output`
    - result: `input`
  - instantiate: `mockto`
    - arguments: `output`
    - result: `input`

`output` are subjects that is recorded and recreated during simulation.

- source: record
- type: stub
- actions
  - get: `user`
    - result: `output`
  - invoke: `user`
    - arguments: `input`
    - result: `output`
  - instantiate: `user`
    - arguments: `input`
    - result: `output`
- special cases:
  - `promosePlugin` will do an `invoke` and override the performer as `plugin`

## Performer

`Performer` indicates who should perform the action.

`user` - actions to be performed by user
`mockto` - actions to be performed by mockto
`plugin` - actions to be performed by respective plugins

## simulation

### get action order invariant

During simulation,
the get calls can be made out of order to certain degree.
This allows both the external dependency and logic code to change when certain property is accessed without breaking the test.
This is allowed as long the the behavior remains the same.

Here is an example:

```ts
(await spec($.ajax))({
  success(response) {
    const json = response.json({ arti: ... } as ArtificalData)
    return {} as Result
  }
} as Options) as Result2
```

The get action on `Options.sucess` can made before the actual ajax call is made,
or when the ajax response is received.
i.e., the implementation of `$.ajax()` can be either:

```ts
$.ajax = (options) => {
  const success = options.success
  fetch(...).then(response => success(response))
}

// or
$.ajax = (options) => {
  fetch(...).then(response => options.success(response))
}
```

Depending on the implementation, the resulting record will be different:

For the first case:

- <ref:0> create passive input stub: ajax() { ... }
- <act:0> you invoke <ref:0>(<ref:1>)
- <ref:1> create active input spy: { success: ... }
- <act:1> I access <ref:1>.success
- <act:2> <ref:1 act:1> -> <ref:2>
- <ref:2> create active input spy: success() { ... }
- <act:3> <ref:0 act:0> -> <ref:3>
- <ref:3> create passive meta stub: { ... } (Result2)

For the second case:

- <ref:0> create passive input stub: ajax() { ... }
- <act:0> you invoke <ref:0>(<ref:1>)
- <ref:1> create active input spy: { success: ... }
- <act:1> <ref:0 act:0> -> <ref:2>
- <ref:2> create passive meta stub: { ... } (Result2)
- <act:2> I access <ref:1>.success
- <act:3> <ref:1 act:2> -> <ref:3>
- <ref:3> create active input spy: success() { ... }

If we strictly enforce the action order, the tests will become brittle.

To accomodate this,

- handle reference id difference between original and actual
- get action can be made multiple times
  - if there are two identical get actions have different result,
  - need to analyze if there are any invoke/instantiate order in between,
  - and draw a line between it so that we know which result to use when additional calls are made
- get action can be missing
- action can be out of order
- invoke and instantiate order cannot be duplicated
  - avoid unexpected performance issue got unnoticed
