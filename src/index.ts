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
import * as genericObject from './object'
import * as promise from './promise'

const { constructedWith, methodInvokedWith } = genericClass
const { invokedWith, returnedWith } = genericFunction
const { rejectedWith, resolvedWith } = promise
export { invokedWith, returnedWith, constructedWith, methodInvokedWith, rejectedWith, resolvedWith }

// order is important, top is generic, bottom is specific.
registerPlugin(genericObject)
registerPlugin(genericFunction)
registerPlugin(genericClass)
registerPlugin(promise)

if (isNode) {
  loadPlugins()
}
