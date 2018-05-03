import { MissingGivenHandler } from './errors'
import { store } from './store'

export async function given(clause: string) {
  let entry = findMatchingEntry(clause)
  if (!entry)
    throw new MissingGivenHandler(clause)
  return clause
}

function findMatchingEntry(clause: string) {
  return store.givenEntries.find(entry => {
    return entry.clause instanceof RegExp && entry.clause.test(clause) ||
      entry.clause === clause
  })
}
