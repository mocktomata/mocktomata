import { ReferenceId, ActionId } from './types'

export type ContextTracker = ReturnType<typeof createContextTracker>

export function createContextTracker() {
  const scopes: { ref: ReferenceId | ActionId, site: Array<string | number> }[] = []
  return {
    enterScope(scope: { ref: ReferenceId | ActionId, site: Array<string | number> }, fn: () => any) {
      scopes.unshift(scope)
      const result = fn()
      scopes.shift()
      return result
    },
    getScope() {
      const source = scopes[0]
      return source && source.site.length > 0 ? source : undefined
    }
  }
}
