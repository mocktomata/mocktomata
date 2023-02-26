import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { isClass } from './class_plugin.utils.js'

export const classPlugin: SpecPlugin<new (...args: any[]) => void, { meta: string; parent: string }> = {
	name: 'class',
	support: isClass,
	createSpy({ getSpy, getSpyId, setMeta, instantiate }, subject) {
		const parent = Object.getPrototypeOf(subject)
		const parentSpy = getSpy(parent)
		setMeta({
			meta: metarize(subject),
			parent: getSpyId(parentSpy)
		})
		const Spy: any = function (...args: any[]) {
			return instantiate({ args }, ({ args }) => {
				const _this = new subject(...args)
				Object.setPrototypeOf(_this, new.target.prototype)
				return _this
			})
		}

		Object.setPrototypeOf(Spy.prototype, subject.prototype)
		Object.setPrototypeOf(Spy, subject)

		return Spy
	},
	createStub({ instantiate, resolve }, subject, meta) {
		const base = subject || demetarize(meta.meta)
		if (subject) {
			resolve(meta.parent, () => Object.getPrototypeOf(subject))
		} else {
			const parentStub = resolve(meta.parent)
			const parent = Object.getPrototypeOf(parentStub)
			if (base.prototype) Object.setPrototypeOf(base.prototype, parent.prototype ?? null)
			Object.setPrototypeOf(base, parent)
		}
		const Stub: any = function (...args: any[]) {
			return instantiate({ args }, () => {
				const _this = new Object()
				Object.setPrototypeOf(_this, new.target.prototype)
				return _this
			})
		}

		// `base` can be `{}` which has no prototype.
		// default to `null` in that case
		Object.setPrototypeOf(Stub.prototype, base.prototype ?? null)
		Object.setPrototypeOf(Stub, base)

		return Stub
	}
}
