import { createTestContext } from '../test-utils/index.js'
import { createIncubator } from './createIncubator.js'

const { context } = createTestContext()
export const incubator = createIncubator(context)
