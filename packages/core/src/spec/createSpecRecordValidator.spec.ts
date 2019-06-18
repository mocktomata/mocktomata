import a from 'assertron';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { createSpecRecordValidator } from './createSpecRecordValidator';
import { SpecRecord } from '..';

const emptyRecord = { refs: [], actions: [] }

const voidInvokeRecord: SpecRecord = {
  refs: [{ plugin: 'function' }],
  actions: [
    { type: 'invoke', ref: '0', tick: 0, payload: [] },
    { type: 'return', ref: 0, tick: 0, payload: undefined }
  ]
}

test('add reference when not expecting one throws ReferenceMismatch', () => {
  const v = createSpecRecordValidator('', emptyRecord)
  a.throws(() => v.addReference({ plugin: 'string', subject: 'abc' }), ReferenceMismatch)
})

test('add reference of not matching plugin throws ReferenceMismatch', () => {
  const v = createSpecRecordValidator('', {
    refs: [{ plugin: 'es5/function' }],
    actions: []
  })

  a.throws(() => v.addReference({ plugin: 'es2015/function' }), ReferenceMismatch)
})

test('end() called when there are remaining active actions throws', () => {
  const v = createSpecRecordValidator('', voidInvokeRecord)

  const err = a.throws(() => v.end(), ActionMismatch)
  expect(err.expected).toEqual({ type: 'invoke', plugin: 'function' })
})

test('end() called when there are remaining passive actions throws', () => {
  const v = createSpecRecordValidator('', voidInvokeRecord)

  v.receive({} as any, voidInvokeRecord.actions[0])

  const err = a.throws(() => v.end(), ActionMismatch)
  expect(err.expected).toEqual({ type: 'return', plugin: 'function' })
})

describe('empty record', () => {
  test.skip('should throw mismatch for any action', () => {
    const v = createSpecRecordValidator('', { refs: [], actions: [] })
    v.addReference({ plugin: 'string', subject: 'abc' })
    a.throws(() => v.receive({} as any, { type: 'invoke', ref: '0', tick: 0, payload: [] }), ActionMismatch)
  })
})
