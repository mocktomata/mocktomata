import { createTestContext } from '../test-utils/index.js'
import { createIncubator } from './createIncubator.js'

const { context, reporter } = createTestContext()
export const incubator = createIncubator(context, reporter)
