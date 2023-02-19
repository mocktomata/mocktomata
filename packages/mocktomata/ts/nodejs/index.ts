import { createKomondor, createMockto, createZucchini } from '@mocktomata/framework'
import { createContext } from './context.js'

export { incubator } from '@mocktomata/framework'

const { context, config, stackFrame: stack } = createContext()
const { scenario, defineStep, defineParameterType } = createZucchini({ context, stackFrame: stack })

export { config }
export { scenario, defineStep, defineParameterType }

export const komondor = createKomondor({ context, stackFrame: stack })
export const kd = komondor

export const mockto = createMockto({ context, stackFrame: stack })
export const mt = mockto
