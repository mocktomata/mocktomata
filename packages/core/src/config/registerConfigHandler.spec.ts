import t from 'assert';
import { registerConfigHandler } from './registerConfigHandler';
import { configHandlerStore } from './store';
describe('registerConfigHandler()', () => {
  test('add to configHandlerStore', () => {
    const expected = () => true
    registerConfigHandler(expected)
    const actual = configHandlerStore.get()
    const index = actual.indexOf(expected)

    t(index >= 0)
    actual.splice(index, 1)
    configHandlerStore.set(actual)
  })
})

// it('all fields can be optional', () => {
//   config({})
// })

// describe('io', () => {
//   it('set url', () => {
//     config({ url: 'http://localhost:3012' })
//   })
//   it('invalid url will throw', () => {
//     const err = a.throws(() => config({ url: 'invalid' }), ConfigPropertyIsInvalid)
//     a.equal(err.property, 'url')
//   })
// })
