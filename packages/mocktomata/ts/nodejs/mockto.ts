import { createMockto } from '@mocktomata/framework'
import { createContext } from './createContext'

const context = createContext()

export const mockto = createMockto(context)

export const mt = mockto
