import type { SpecPlugin } from '../../spec-plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { hasProperty, isBaseObject } from '../../utils/index.js'

export const instancePlugin: SpecPlugin<
	Record<string | number, any>,
	{ base: string; classConstructor: string; functionCalls: string[] }
> = {
	name: 'instance',
	support: subject => {
		if (subject === null) return false
		if (typeof subject !== 'object') return false
		return !isBaseObject(Object.getPrototypeOf(subject))
	},
	createSpy: ({ getProperty, invoke, setProperty, setMeta, getSpyId, setSpyOptions }, subject) => {
		const classConstructor = Object.getPrototypeOf(subject).constructor
		setSpyOptions(classConstructor, { plugin: '@mocktomata/class' })
		const meta = setMeta({
			base: metarize(subject),
			classConstructor: getSpyId(classConstructor),
			functionCalls: []
		})
		const spy = new Proxy(subject, {
			get(target: any, key: string) {
				if (!hasProperty(subject, key)) return undefined
				const prop = subject[key]
				if (typeof prop === 'function') {
					return (...args: any[]) => {
						meta.functionCalls.push(key)
						return invoke({ site: key, thisArg: spy, args }, ({ args }) => prop.apply(target, args))
					}
				} else {
					return getProperty({ key }, () => prop)
				}
			},
			set(_, property: string, value: any) {
				return setProperty({ key: property, value }, value => (subject[property] = value))
			}
		})

		return spy
	},
	createStub: ({ getProperty, setProperty, resolve, invoke }, _, meta) => {
		const base = demetarize(meta.base)
		const classConstructor = resolve(meta.classConstructor)
		const classProto = Object.getPrototypeOf(classConstructor)
		// `classProto` can be `{}` which has no prototype.
		// default to `null` in that case
		Object.setPrototypeOf(base, classProto.prototype ?? null)
		const stub = new Proxy(base, {
			get(_: any, property: string) {
				if (meta.functionCalls.length > 0 && meta.functionCalls[0] === property) {
					return (...args: any[]) => {
						meta.functionCalls.shift()
						return invoke({ site: property, thisArg: stub, args })
					}
				}
				return getProperty({ key: property })
			},
			set(_, key: string, value: any) {
				return setProperty({ key, value })
			}
		})
		return stub
	}
}
