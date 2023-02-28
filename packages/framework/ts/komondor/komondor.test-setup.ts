import type { Komondor, Spec } from '../index.js'

export function indirectKomondor(komondor: Komondor.Fn, specName: string, options?: Spec.Options) {
	return komondor(specName, options)
}
