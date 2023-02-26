import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { hasProperty } from '../../utils/index.js'

export const arrayPlugin: SpecPlugin<any[], { meta: string; items: string[] }> = {
	name: 'array',
	support: Array.isArray,
	createSpy({ setMeta, getSpy, getSpyId, getProperty, setProperty }, subject) {
		const items = subject.map(getSpy)
		setMeta({
			meta: metarize(subject),
			items: items.map(getSpyId)
		})
		return new Proxy(items, {
			get(target, key: string) {
				if (!hasProperty(subject, key)) return undefined
				const a = Array.prototype[key as any]
				if (a) return a
				if (!hasProperty(target, key)) {
					return getProperty({ key }, () => (subject as any)[key])
				}
				return getProperty({ key }, () => (target as any)[key])
			},
			set(target, key: any, value) {
				return setProperty({ key, value }, value => {
					subject[key] = target[key] = value
				})
			}
		})
	},
	createStub({ getProperty, setProperty, resolve }, _, { meta, items }) {
		const base = Object.assign(items.map(i => resolve(i)), demetarize(meta))
		return new Proxy(base, {
			get(_: any, key: string) {
				const a = Array.prototype[key as any]
				if (a) return a
				return getProperty({ key })
			},
			set(target: any, property: any, value: any) {
				target[property] = value
				return setProperty({ key: property, value })
			}
		})
	}
}
