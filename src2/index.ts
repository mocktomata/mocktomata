// import * as genericClass from './class'
import * as genericFunction from './function'
// import * as instance from './instance'

import { isNode } from '../isNode'
import { registerPlugin, loadPlugins } from '../plugin'
// import * as promise from './promise'
// import {
//   scenario,
//   // @ts-ignore
//   ScenarioSpec
// } from './scenario'

export * from '../artifact'
export * from '../config'
export * from '../errors'
export * from '../interfaces'
export * from '../scenario'
export * from '../spec'
export * from './komondor'

export { registerPlugin }


// order is important, top is generic, bottom is specific.
// registerPlugin(genericObject)
registerPlugin(genericFunction)
// registerPlugin(genericClass)
// registerPlugin(instance)
// registerPlugin(promise)

// istanbul ignore next
if (isNode) {
  loadPlugins()
}
