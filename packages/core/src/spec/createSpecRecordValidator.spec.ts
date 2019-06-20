test.todo('no test for now')
// import a from 'assertron';
// import { ActionMismatch, ReferenceMismatch } from './errors';
// import { createValidatingRecord } from './createValidatingRecord';
// import { SpecRecord } from '..';

// const emptyRecord = { refs: [], actions: [] }

// const voidInvokeRecord: SpecRecord = {
//   refs: [{ plugin: 'function' }],
//   actions: [
//     { type: 'invoke', ref: '0', tick: 0, payload: [] },
//     { type: 'return', ref: 0, tick: 0, payload: undefined }
//   ]
// }

// test('add reference when not expecting one throws ReferenceMismatch', () => {
//   const v = createValidatingRecord('', emptyRecord)
//   a.throws(() => v.addRef({ plugin: 'string', subject: 'abc' }), ReferenceMismatch)
// })

// test('add reference of not matching plugin throws ReferenceMismatch', () => {
//   const v = createValidatingRecord('', {
//     refs: [{ plugin: 'es5/function' }],
//     actions: []
//   })

//   a.throws(() => v.addRef({ plugin: 'es2015/function' }), ReferenceMismatch)
// })

// test('end() called when there are remaining active actions throws', () => {
//   const v = createValidatingRecord('', voidInvokeRecord)

//   const err = a.throws(() => v.end(), ActionMismatch)
//   expect(err.expected).toEqual({ type: 'invoke', plugin: 'function' })
// })

// test('end() called when there are remaining passive actions throws', () => {
//   const v = createValidatingRecord('', voidInvokeRecord)

//   v.addAction({} as any, voidInvokeRecord.actions[0])

//   const err = a.throws(() => v.end(), ActionMismatch)
//   expect(err.expected).toEqual({ type: 'return', plugin: 'function' })
// })

// describe('empty record', () => {
//   test.skip('should throw mismatch for any action', () => {
//     const v = createValidatingRecord('', { refs: [], actions: [] })
//     v.addRef({ plugin: 'string', subject: 'abc' })
//     a.throws(() => v.addAction({} as any, { type: 'invoke', ref: '0', tick: 0, payload: [] }), ActionMismatch)
//   })
// })
