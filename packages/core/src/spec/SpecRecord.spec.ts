import { findSourceInfo, addReference } from './SpecRecord';
import { SpecReferenceLive } from './types-internal';

describe('findSource()', () => {
  test('no other reference gets undefined', () => {
    const refs: SpecReferenceLive[] = []
    const subject = () => true
    addReference(refs, { plugin: 'fn', subject })

    expect(findSourceInfo(refs, subject)).toBeUndefined()
  })

  test('find within array', () => {
    const refs: SpecReferenceLive[] = []
    const subject = () => true
    addReference(refs, { plugin: 'array', subject: [subject] })

    expect(findSourceInfo(refs, subject)).toEqual({ id: '0', path: [0] })
  })

  test('find within object', () => {
    const refs: SpecReferenceLive[] = []
    const subject = () => true
    addReference(refs, { plugin: 'obj', subject: { a: subject } })

    expect(findSourceInfo(refs, subject)).toEqual({ id: '0', path: ['a'] })
  })

  test('find within object in array', () => {
    const refs: SpecReferenceLive[] = []
    const subject = () => true
    addReference(refs, { plugin: 'array', subject: [false, { a: subject }] })

    expect(findSourceInfo(refs, subject)).toEqual({ id: '0', path: [1, 'a'] })
  })

  test('find within arry in object', () => {
    const refs: SpecReferenceLive[] = []
    const subject = () => true
    addReference(refs, { plugin: 'obj', subject: { a: [subject] } })

    expect(findSourceInfo(refs, subject)).toEqual({ id: '0', path: ['a', 0] })
  })
})
