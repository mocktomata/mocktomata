export function printChain(e: any) {
	let base = e
	let p
	do {
		p = Object.getPrototypeOf(base)
		console.info(p, p ? `<input> instanceof <parent>: ${e instanceof p.constructor}` : 'null')
		base = p
	} while (p)
}
