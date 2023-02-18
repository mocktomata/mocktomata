import { SerializableConverter } from 'iso-error'
import { demetarize, metarize, type ObjectMeta } from '../../spec/metarize.js'
import type { SpecPlugin } from '../../spec_plugin/types.js'
import { hasProperty } from '../../utils/index.js'

const converter = new SerializableConverter()

export const errorPlugin: SpecPlugin<Error & Record<any, any>, { err: ObjectMeta; functionCalls: string[] }> = {
	name: 'error',
	support: subject => subject instanceof Error,
	createSpy: ({ getProperty, invoke, setProperty, setMeta }, subject) => {
		const meta = setMeta({
			err: metarize(converter.toSerializable(subject))as ObjectMeta,
			functionCalls: []
		})
		setMeta(meta)
		const spy = new Proxy(subject, {
			get(target, key: string) {
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
			set(_, key: string, value: any) {
				return setProperty({ key, value }, value => (subject[key] = value))
			}
		})
		return spy
	},
	createStub: ({ getProperty, setProperty, invoke }, _subject, meta) => {
		const base = converter.fromSerializable(demetarize(meta.err))
		const stub = new Proxy(base, {
			get(_: any, key: string) {
				if (meta.functionCalls.length > 0 && meta.functionCalls[0] === key) {
					return (...args: any[]) => {
						meta.functionCalls.shift()
						return invoke({ site: key, thisArg: stub, args })
					}
				}
				return getProperty({ key: key })
			},
			set(_, key: string, value: any) {
				return setProperty({ key, value })
			}
		})
		return stub
	}
}
