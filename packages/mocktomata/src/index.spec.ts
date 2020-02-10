import { NotSpecable, SpecIDCannotBeEmpty, SpecNotFound } from '@mocktomata/framework'
import a from 'assertron'
import { CannotConfigAfterUsed, config, mockto } from '.'

describe('config()', () => {
  mockto('config() can only be called before using mockto', (title, spec) => {
    test(title, async () => {
      await spec({})
      a.throws(() => config({}), CannotConfigAfterUsed)
    })
  })
});

function noop() { }

mockto('', (_, spec) => {
  test('spec id cannot be empty (auto)', async () => {
    await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
  })
})

mockto.save('', (_, spec) => {
  test('spec id cannot be empty (save)', async () => {
    await a.throws(spec(noop), SpecIDCannotBeEmpty)
  })
})

mockto.simulate('', (_, spec) => {
  test('spec id cannot be empty (simulate)', async () => {
    await a.throws(spec(noop), SpecIDCannotBeEmpty)
  })
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

mockto.simulate('not exist', (_, spec) => {
  test('simulate throws if spec record does not exist', async () => {
    await a.throws(spec((x: any) => x), SpecNotFound)
  })
})

test.todo('plugin with passive spy (same as subject spy)')

mockto('calling handler without options', (title, spec) => {
  test(title, async () => {
    expect(title).toEqual('calling handler without options')
    const subject = await spec((x: number) => x)
    expect(subject(3)).toBe(3)

    await spec.done()
  })
})

mockto('calling handler with options', { timeout: 100 }, (title, spec) => {
  test(title, async () => {
    expect(title).toEqual('calling handler with options')
    const subject = await spec((x: number) => x)
    expect(subject(3)).toBe(3)

    await spec.done()
  })
})
