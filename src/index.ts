export * from './config'
export * from './given'
export * from './errors'
export * from './interfaces'
export * from './io'
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
  functionInvoked,
  functionReturned,
  functionThrown
} = genericFunction
const {
  promiseResolved,
  promiseRejected
} = promise
export {
  classConstructed,
  classMethodInvoked,
  classMethodReturned,
  classMethodThrown,
  functionInvoked,
  functionReturned,
  functionThrown,
  promiseResolved,
  promiseRejected
}

// order is important, top is generic, bottom is specific.
// registerPlugin(genericObject)
registerPlugin(genericFunction)
registerPlugin(genericClass)
registerPlugin(promise)

if (isNode) {
  loadPlugins()
}
