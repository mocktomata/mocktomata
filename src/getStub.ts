export function getStub<T>(context, plugin, subject: T): T {
  const stub = plugin.getStub(context, subject)

  const otherPropertyNames = Object.keys(subject)
  if (otherPropertyNames.length === 0) return stub as any

  const others = otherPropertyNames.reduce((p, k) => {
    p[k] = subject[k]
    return p
  }, {})

  return Object.assign(stub, others) as any
}
