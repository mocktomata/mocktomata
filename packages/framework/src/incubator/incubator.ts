import { createTestContext } from '../test-utils'
import { createIncubator } from './createIncubator'

const context = createTestContext()
export const incubator = createIncubator(context)
