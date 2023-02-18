import type { SpecPlugin } from '../../spec_plugin/types.js'
import { isPromise } from './promise_plugin.utils.js'

export const promisePlugin: SpecPlugin<Promise<any>, string> = {
	name: 'promise',
	support: isPromise,
	createSpy({ invoke, setMeta }, subject) {
		return subject.then(
			v =>
				new Promise(a => {
					setMeta('resolved-promise')
					// the plugin trigger this invoke action to capture and simulate the resolving promise invoking this very function.
					// the `(_: any) => v` is mimicking the resolve function to be called by mockto during stub.
					// so for the stub, mockto will invoke the resolve function represented by this `(_: any) => v` function.
					return invoke(
						{
							performer: 'plugin',
							site: 'then',
							thisArg: undefined,
							args: [a]
						},
						({ args: [fn] }) => fn(v)
					)
				}),
			v =>
				new Promise((_, r) => {
					setMeta('rejected-promise')
					// the plugin trigger this invoke action to capture and simulate the rejecting promise invoking this very function.
					// the `(v: any) => { throw v }` is mimicking the reject function to be called by mockto during stub.
					// so for the stub, mockto will invoke the reject function.
					// the `throw v` is used during spy to throw the error handled by this rejecting block,
					// so that the resulting promise still rejects as the original.
					return invoke(
						{
							performer: 'plugin',
							site: 'then',
							thisArg: undefined,
							args: [undefined, r]
						},
						({ args: [_, fn] }) => fn!(v)
					)
				})
		)
	},
	createStub({ on }, _, meta) {
		return new Promise((a, r) => {
			on({
				type: 'invoke',
				site: 'then',
				thisArg: undefined,
				args: meta === 'resolved-promise' ? [a] : [undefined, r]
			})
		})
	}
}
