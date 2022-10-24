import { createMockto } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-remote'
import { AsyncContext } from 'async-fp'
import { createStandardLog } from 'standard-log'

const context = new AsyncContext(async () => {
  const io = await createIO()
  const log = createStandardLog().getLogger('mocktomata')
  return { io, log }
})
export const mockto = createMockto(context)
