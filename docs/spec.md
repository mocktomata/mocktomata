# spec

This is the user manual for `spec`.

You will get a `spec` object when using [`mockto`](./mockto.md), [`komondor`](./komondor.md) and [`incubator`](./incubator.md).

It is the main mechanism to record the behaviors.

## `spec<S>(subject: S): Promise<S>`

This tell the `spec` to create a `test double` of the `subject`.
The `test double` should be used in place of the `subject`.
It will record or replay the behavior depends on which `mode` the `spec` is in.

You can use `spec` to create test doubles for multiple subjects.
This is useful when using `mocktomata` in production code.
It should work as is (but not tested at the moment. So if you encounter any issue, please file an issue [here](https://github.com/mocktomata/mocktomata/issues)).

## `spec.done(): Promise<void>`

Tell the `spec` that you are done.
The `spec` will then stop the system and record the behavior as needed.

## `spec.enableLog(): void`

Enable log for this specific `spec`.
This is mostly for debug purpose at the moment.

## `spec.ignoreMismatch(value)`

Sometimes the input you provide to the test may not be static.
For example, random number, date time, or hostnames.

In 7.0, reference values (string, object, array, function) are not validate for changes,
i.e. even if you pass in a different string, the system will not fail it with `ActionMismatch` error.
This is because we track the behavior, not and exact call, whenever possible.

This is a new concept and is subject to change if it does not work well.

On the other hand, primitive values such as number and boolean are validated.

If you want to tell `spec` that it should not care about the changes,
you can use `spec.ignoreMismatch()`.
