import { createKomondor, createMockto, createZucchini } from '@mocktomata/framework'
import { createContext } from './createContext.js'

export { incubator } from '@mocktomata/framework'

const { context, config } = createContext()
const { scenario, defineStep, defineParameterType } = createZucchini(context)

export { config }
export { scenario, defineStep, defineParameterType }

export const komondor = createKomondor(context)
export const kd = komondor

export const mockto = createMockto(context)
export const mt = mockto
