import { promisePlugin } from './promisePlugin';

test('simple object is not supported by promisePlugin', () => {
  expect(promisePlugin.support({})).toBe(false)
})

test('support promise object', () => {
  const prom = Promise.resolve()
  expect(promisePlugin.support(prom)).toBe(true)
})

test('', () => {
  
})