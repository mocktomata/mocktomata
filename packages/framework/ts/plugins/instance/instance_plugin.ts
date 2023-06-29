import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, hasProperty, isBaseObject, metarize, type SpecMeta } from '../../utils/index.js'
import { isClass } from '../class/class_plugin.utils.js'

export const instancePlugin: SpecPlugin<
	Record<string | number, any>,
	{ base: SpecMeta; classConstructor: string; functionCalls: string[] }
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
			get(target, key: any, receiver) {
				if (!hasProperty(subject, key)) return undefined
				const prop = subject[key]
				if (typeof prop === 'function') {
					return function (...args: any[]) {
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
	createStub: ({ getProperty, setProperty, resolve, invoke, log }, _, meta) => {
		const base = demetarize(meta.base)
		const classConstructor = resolve(meta.classConstructor)
		const classProto = Object.getPrototypeOf(classConstructor)
		if (!isClass(classProto) && !isBuiltInClass(classProto)) {
			log.warn(`Detected an instance with unrecognized class: ${classProto.name}.

You need to spec that class for 'instanceof' to work correctly.`)
		}

		// `classProto` can be `{}` which has no prototype.
		// default to `null` in that case
		const proto = classProto.prototype ? Object.create(classProto.prototype) : null
		Object.setPrototypeOf(base, proto)
		const stub = new Proxy(base as any, {
			get(_: any, key: any) {
				if (meta.functionCalls.length > 0 && meta.functionCalls[0] === key) {
					return (...args: any[]) => {
						meta.functionCalls.shift()
						return invoke({ site: key, thisArg: stub, args })
					}
				}
				const prop = getProperty({ key })
				if (typeof key === 'symbol') {
					console.log('sym.desc', key.description)
					if (key.description) {
						const y = Symbol.for(key.description)

						console.log(y, key === y, key === Symbol.iterator)
					}
				}
				console.log('key', key, prop)
				return prop
			},
			set(_, key: string, value: any) {
				return setProperty({ key, value })
			}
		})
		return stub
	}
}

function isBuiltInClass(classProto: any) {
	// generator is detected as a class with no name
	if (!classProto.name) return true

	return ['Error', 'Map', 'Set'].indexOf(classProto.name) >= 0
}
