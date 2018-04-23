export * from './config'
export * from './given'
export * from './errors'
export * from './interfaces'
export * from './spec'

import { registerPlugin, loadPlugins } from './plugin'
import { isNode } from './isNode'
export { registerPlugin }
import * as genericClass from './class'
import * as genericFunction from './function'
// import * as genericObject from './object'
import * as promise from './promise'

const {
  classConstructed,
  classMethodInvoked,
  classMethodReturned,
  classMethodThrown
} = genericClass

const {
  functionConstructed,
  functionInvoked,
  functionReturned,
  functionThrown
} = genericFunction
const {
  promiseConstructed,
  promiseResolved,
  promiseRejected
} = promise

export {
  classConstructed,
  classMethodInvoked,
  classMethodReturned,
  classMethodThrown,
  functionConstructed,
  functionInvoked,
  functionReturned,
  functionThrown,
  promiseConstructed,
  promiseResolved,
  promiseRejected
}

// order is important, top is generic, bottom is specific.
// registerPlugin(genericObject)
registerPlugin(genericFunction)
registerPlugin(genericClass)
registerPlugin(promise)

// istanbul ignore next
if (isNode) {
  loadPlugins()
}
