import { CallRecord } from './interfaces'

export function createCallRecordCreator(args: any[]) {
  let resolve
  let reject
  const p = new Promise((a, r) => {
    resolve = a
    reject = r
  })

  return {
    resolve,
    reject,
    callRecord: Object.assign(p, {
      arguments: args,
      lastUpdate: new Date(),
      new: true
    }) as CallRecord
  }
}
