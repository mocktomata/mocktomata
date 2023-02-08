import type { SpecPlugin } from '@mocktomata/framework'

export function activate(context: SpecPlugin.ActivationContext) {
	context.register({
		name: '@mocktomata/plugin-fixture-dummy',
		support() {
			return false
		},
		createSpy() {
			return
		},
		createStub() {
			return
		}
	})
}
