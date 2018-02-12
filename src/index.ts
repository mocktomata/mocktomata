export * from './config'
export * from './given'
export * from './errors'
export * from './interfaces'
export * from './io'
export * from './spec'

import { registerPlugin } from './plugin'
export { registerPlugin }
import * as childProcess from './childProcess'
import * as genericClass from './class'
import * as genericFunction from './function'
import * as promise from './promise'
import * as stream from './stream'
// import * as ws from './ws'
import { KOMONDOR_CONFIG } from './constants'

// order is important, top is generic, bottom is specific.
registerPlugin(promise)
registerPlugin(stream)
registerPlugin(childProcess)
registerPlugin(genericFunction)
registerPlugin(genericClass)
// registerPlugin(ws)

if (KOMONDOR_CONFIG && KOMONDOR_CONFIG.plugins) {
  KOMONDOR_CONFIG.plugins.forEach(p => {
    const m = require(p)
    registerPlugin(m)
  })
}
