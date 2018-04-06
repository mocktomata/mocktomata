# Design note

## Instance ID

What is an instance?

- spec instance
- fake instance (spy and stub)
- object instance (class)
- invocation

Spec instance is hidden from the plugin.
i.e. what passed to plugin is still a context instance

```ts
spec(subject) // spec instance

SpyContext  // per spec instance

plugin.getSpy(...) {
  // spy instance per plugin type `type: 'class'`
  return class extends subject {
    constructor() {
      this.__komondor.instance = newInstance() // per invocation instance
    }
    do() {
      // per call
    }
  }
}
plugin.getSpy(context, subject)
  // each subject is a different instance.
  return function(...args) {
    // invocation
  }
  if (cache[subject]) return cache[subject]

  return cache[subject] = (() => {
    const instance;
    return function(...args) {
      // invocation
    }
  })()
  return cache[subject] || cache[subject] = function(...args) {
    ...
  }
}

plubin.getSpy(context, subject) {
  // promise can be listened to multiple time,
  // but yields the same result.
}
