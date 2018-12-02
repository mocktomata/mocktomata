export function createExpectation(type: string, name: string, baseMeta?: { [k: string]: any }) {
  return (payload?: any, meta?: { [k: string]: any }) => {
    if (!baseMeta && !meta)
      return { type, name, payload }
    return { type, name, payload, meta: { ...baseMeta, ...meta } }
  }
}

export function createScopedCreateExpectation(scope: string) {
  return (subType: string, name: string, baseMeta?: { [k: string]: any }) => (payload?: any, meta?: { [k: string]: any }) => {
    if (!baseMeta && !meta)
      return { type: `${scope}/${subType}`, name, payload }
    return { type: `${scope}/${subType}`, name, payload, meta: { ...baseMeta, ...meta } }
  }
}
