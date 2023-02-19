import { createKomondor, createMockto, createTestContext, createZucchini } from '@mocktomata/framework'

export { incubator } from '@mocktomata/framework'

const { context, config, stackFrame } = createTestContext()
const { scenario, defineStep, defineParameterType } = createZucchini({ context, stackFrame })

export { config }
export { scenario, defineStep, defineParameterType }

export const komondor = createKomondor({ context, stackFrame })
export const kd = komondor

export const mockto = createMockto({ context, stackFrame })
export const mt = mockto
