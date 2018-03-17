export * from './config'
export * from './given'
export * from './errors'
export * from './interfaces'
export * from './io'
export * from './spec'

import { registerPlugin, loadPlugins } from './plugin'
import { isNode } from './isNode'
export { registerPlugin }
import * as childProcess from './childProcess'
import * as genericClass from './class'
import * as genericFunction from './function'
import * as promise from './promise'
import * as stream from './stream'

// order is important, top is generic, bottom is specific.
registerPlugin(promise)
registerPlugin(stream)
registerPlugin(childProcess)
registerPlugin(genericFunction)
registerPlugin(genericClass)

if (isNode)
  loadPlugins()
