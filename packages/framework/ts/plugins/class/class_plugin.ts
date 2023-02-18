import type { SpecPlugin } from '../../spec_plugin/types.js'
import { demetarize, metarize } from '../../spec/metarize.js'
import { isClass } from './class_plugin.utils.js'

export const classPlugin: SpecPlugin<new (...args: any[]) => void> = {
	name: 'class',
	support: isClass,
	createSpy(context, subject) {
		context.setMeta(metarize(subject))
		const Spy: any = function (...args: any[]) {
			return context.instantiate({ args }, ({ args }) => {
				const _this = new subject(...args)
				Object.setPrototypeOf(_this, new.target.prototype)
				return _this
			})
		}

		Object.setPrototypeOf(Spy.prototype, subject.prototype)
		Object.setPrototypeOf(Spy, subject)

		return Spy
	},
	createStub(context, subject, meta) {
		const base = subject || demetarize(meta)
		const Stub: any = function (...args: any[]) {
			return context.instantiate({ args }, () => {
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
