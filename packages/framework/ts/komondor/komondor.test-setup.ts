import type { Komondor, Spec } from '../index.js'

// The return type is annotated explicitly: standard-log 13 declares its
// symbols in its own deep modules rather than flattening them through
// `export *`, so the inferred type is not portable under pnpm (TS2742).
export function indirectKomondor(
	komondor: Komondor.Fn,
	specName: string,
	options?: Spec.Options
): ReturnType<Komondor.Fn> {
	return komondor(specName, options)
}
