import merge from 'lodash.merge'

import { MissingClauseHandler } from './errors'
import { store } from './store'

export async function environment(clause: string) {
  const entries = store.envEntries.filter(entry => {
    return entry.clause instanceof RegExp && entry.clause.test(clause) ||
      entry.clause === clause
  })

  if (entries.length === 0)
    throw new MissingClauseHandler(clause)
  else {
    const context = {}
    entries.filter(e => !e.invoked).map(async e => {
      e.invoked = true
      const localContext = await e.handler()
      if (localContext)
        merge(context, localContext)
    })
    return context
  }
}

export function onEnvironment(clause: string | RegExp, handler) {
  store.envEntries.push({ clause, handler })
}
