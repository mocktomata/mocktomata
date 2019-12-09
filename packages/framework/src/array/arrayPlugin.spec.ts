import { createSpyContextStub } from '../incubator'
import { SpecPlugin } from '../spec'
import { arrayPlugin } from './arrayPlugin'

function setupSpyArrayTest(subject: any[], partialContext?: Partial<SpecPlugin.SpyContext>) {
  return arrayPlugin.createSpy(createSpyContextStub(partialContext), subject)
}

test('empty array', () => {
  const array = setupSpyArrayTest([])
  expect(array.length).toBe(0)
})

test('capture meta data for primitive array', () => {
  let meta
  const array = setupSpyArrayTest([1, 2, 3], { setMeta: m => meta = m })

  expect(array.length).toBe(3)
  expect(array).toEqual([1, 2, 3])
  expect(meta).toEqual([1, 2, 3])
})

test('capture refId in meta', () => {
  let meta
  setupSpyArrayTest([1, { a: 1 }], {
    setMeta: m => meta = m,
    getSpyId: (value) => typeof value === 'object' ? '0' : value
  })

  expect(meta).toEqual([1, '0'])
})

test('can push', () => {
  const array = setupSpyArrayTest([1, 2, 3])
  array.push(4, 5)
  expect(array.length).toBe(5)
})

test('can update value', () => {
  const array = setupSpyArrayTest([1, 2, 3])
  array[1] = 4
  expect(array.length).toBe(3)
  expect(array).toEqual([1, 4, 3])
})

test('can expend by assign', () => {
  const array = setupSpyArrayTest([1, 2, 3])
  array[5] = 4
  expect(array.length).toBe(6)
})
