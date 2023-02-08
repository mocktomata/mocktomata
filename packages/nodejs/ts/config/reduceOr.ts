export function reduceOr<V>(values: Array<[string, V] | undefined>) {
	const result = values.reduce((p, v) => {
		if (v === undefined) return p
		const value = v[1]
		if (value === undefined) return p
		p[v[0]] = value
		return p
	}, {} as Record<string, unknown>)
	return Object.keys(result).length === 0 ? undefined : result
}
