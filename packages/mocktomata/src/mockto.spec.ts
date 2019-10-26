import a from 'assertron';
import { incubator, SpecIDCannotBeEmpty, NotSpecable, SpecNotFound } from '@mocktomata/framework';
import { mockto } from './mockto';


beforeAll(() => {
  const harness = incubator.createTestHarness({ target: 'es2015' })
  return harness.start()
})

test('spec id cannot be empty', async () => {
  await a.throws(mockto(''), SpecIDCannotBeEmpty)
  await a.throws(mockto.save(''), SpecIDCannotBeEmpty)
  await a.throws(mockto.simulate(''), SpecIDCannotBeEmpty)
})

mockto.save(`type %s is not specable`, (title, spec) => {
  test.each<[any, any]>([
    ['undefined', undefined],
    ['null', null],
    ['number', 1],
    ['boolean', true],
    ['symbol', Symbol()],
    ['string', 'string'],
    ['array', []]
  ])(title, async ([, value]) => {
    await a.throws(() => spec(value), NotSpecable)
  })
})

test('simulate throws if spec record does not exist', async () => {
  await a.throws(mockto.simulate('not exist').then(s => s((x: any) => x)), SpecNotFound)
})

test.todo('plugin with passive spy (same as subject spy)')

mockto.save('calling handler without options', (title, spec) => {
  test(title, async () => {
    expect(title).toEqual('calling handler without options')
    const subject = await spec((x: number) => x)
    expect(subject(3)).toBe(3)
  })
})

mockto.save('calling handler with options', { timeout: 100 }, (title, spec) => {
  test(title, async () => {
    expect(title).toEqual('calling handler with options')
    const subject = await spec((x: number) => x)
    expect(subject(3)).toBe(3)
  })
})
