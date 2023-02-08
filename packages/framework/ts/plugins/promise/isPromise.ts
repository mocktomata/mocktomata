export function isPromise(value: any): value is Promise<any> {
	if (!value) return false

	const proto = Object.getPrototypeOf(value)
	return proto && proto.constructor === Promise
}
