import { AsyncContext } from 'async-fp'
import path from 'path'
import { createMockto } from '..'
import { createTestIO } from '../incubator/createTestIO'

test('live with no options', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'live with no options'
  return new Promise(a => {
    mockto.live(title, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(s => {
        expect(s(1)).toBe(2)
        a()
      })
    })
  })
})

test('live with options', () => {
  const context = createTestContext()
  const mockto = createMockto(context)
  const title = 'live with options'
  return new Promise(a => {
    mockto.live(title, { timeout: 2000 }, (specName, spec) => {
      expect(specName).toEqual(title)
      spec((x: number) => x + 1).then(s => {
        expect(s(1)).toBe(2)
        a()
      })
    })
  })
})

function createTestContext() {
  return new AsyncContext<createMockto.Context>({
    getCallerRelativePath(_) { return path.relative(process.cwd(), __filename) },
    config: { plugins: [] },
    io: createTestIO()
  })
}
