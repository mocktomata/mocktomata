import { demetarize, hasProperty, metarize, type SpecPlugin } from 'mocktomata/plugins'

export const plugin: SpecPlugin = {
	name: 'axios',
	support: (subject: any) => {
		if (!subject?.interceptors) return false
		if (!subject.interceptors?.request) return false
		if (!subject.interceptors?.response) return false
		if (subject.interceptors.request.constructor?.name !== 'InterceptorManager') return false
		if (subject.interceptors.response.constructor?.name !== 'InterceptorManager') return false
		return true
	},
	createSpy: ({ getProperty, setProperty, setMeta }, subject) => {
		setMeta(metarize(subject))
		return new Proxy(subject, {
			get(_: any, key: string) {
				if (!hasProperty(subject, key)) return undefined
				if (['interceptors'].indexOf(key) >= 0) return subject[key]
				return getProperty({ key }, () => subject[key])
			},
			set(_, key: string, value: any) {
				return setProperty({ key, value }, value => (subject[key] = value))
			}
		})
	},
	createStub: ({ getProperty, setProperty }, _, meta) => {
		return new Proxy(demetarize(meta), {
			get(_: any, key: string) {
				if (key === 'interceptors')
					return {
						request: dummyInterceptorManager,
						response: dummyInterceptorManager
					}
				return getProperty({ key })
			},
			set(_, key: string, value: any) {
				return setProperty({ key, value })
			}
		})
	}
}

const dummyInterceptorManager = {
	clear: () => {},
	eject: () => {},
	use: () => {}
}
