import { createTestContext } from '../testing/index.js'
import { createIncubator } from './create_incubator.js'

export const incubator = createIncubator(createTestContext())
