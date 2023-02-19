import { createStackFrameContext } from './stack_frame.js'

it('returns the current call sites', () => {
	const { stackFrame: stack } = createStackFrameContext(process.cwd())

	const r = stack.getCallSites()
	expect(r[0]).toMatch(/stack_frame.get_call_sites.spec.ts/)
})
