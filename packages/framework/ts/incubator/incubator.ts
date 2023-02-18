import { createTestContext } from '../testutils/index.js'
import { createIncubator } from './create_incubator.js'

const { context } = createTestContext()
export const incubator = createIncubator(context)
