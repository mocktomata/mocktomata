import type { Spec, Zucchini } from '../index.js'

export function indirectZucchini(scenario: Zucchini.Fn, specName: string, options?: Spec.Options) {
  return scenario(specName, options)
}
