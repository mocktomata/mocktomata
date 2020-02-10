import { createMockto } from '../utils'
import { initializeContext } from './initializeContext'
import { store } from './store'

export const mockto = createMockto({ initializeContext, store })
