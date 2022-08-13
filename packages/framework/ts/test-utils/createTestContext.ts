import { AsyncContext } from 'async-fp'
import { requiredDeep } from 'type-plus'
import { createTestIO } from './createTestIO'

export function createTestContext(options?: createTestIO.Options) {
  const { config, modules } = requiredDeep({ config: { ecmaVersion: '2015', plugins: [] }, modules: {} }, options)
  const io = createTestIO({ config, modules })
  return new AsyncContext({ config, io, timeTrackers: [], maskCriteria: [] })
}
