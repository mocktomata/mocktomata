import { createKomondor, createMockto, createZucchini } from '@mocktomata/framework'
import { createContext } from './context.js'

const { context, config, stackFrame } = createContext()
const { scenario, defineStep, defineParameterType } = createZucchini({ context, stackFrame })

export { config }
export { scenario, defineStep, defineParameterType }

export const komondor = createKomondor({ context, stackFrame })
export const kd = komondor

export const mockto = createMockto({ context, stackFrame })
export const mt = mockto
