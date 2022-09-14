import { createMockto } from '@mocktomata/framework'
import { createContext } from './createContext.js'

export const mockto = createMockto(createContext())
export const mt = mockto
