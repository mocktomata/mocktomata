import { createKomondor, createMockto, createZucchini } from '@mocktomata/framework'
import { createContext } from './createContext.js'

const { context, config } = createContext()
const { scenario, defineStep } = createZucchini(context)

export { config }
export { scenario, defineStep }

export const komondor = createKomondor(context)
export const kd = komondor

export const mockto = createMockto(context)
export const mt = mockto




