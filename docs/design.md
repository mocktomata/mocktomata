# Design


```ts

function subject(callback: Function) {
  callback()
}
```

- `subject()`:  `createSpy()` -> `{ withSource: true }` fake: receive actual calls and get results from record.
- `callback()`: `createSpy()` -> `{ withSource: true, doNotStub: true }` => invoke source function (`createSpy()` to replay action?)

```ts

function subject() {
  return Promise.resolve(() => 1)
}
```

- `Promise()`: `{ withSource: false }`: get behavior (resolve/reject) from record, and call the right result.
- `() => 1`: `{ withSource: false }` need to completely simulate => fake: receive actual calls and get results from record.
