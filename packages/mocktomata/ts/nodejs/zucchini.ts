import { createZucchini } from '@mocktomata/framework'
import { createContext } from './createContext.js'

const { scenario, defineStep } = createZucchini(createContext())

export { scenario, defineStep }
