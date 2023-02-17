import { createKomondor, createMockto, createTestContext, createZucchini } from '@mocktomata/framework'

export { incubator } from '@mocktomata/framework'

const { context, config } = createTestContext()
const { scenario, defineStep, defineParameterType } = createZucchini(context)

export { config }
export { scenario, defineStep, defineParameterType }

export const komondor = createKomondor(context)
export const kd = komondor

export const mockto = createMockto(context)
export const mt = mockto
