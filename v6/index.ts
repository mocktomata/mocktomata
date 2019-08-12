import * as genericClass from './class'
import {
  config,
  // @ts-ignore
  Config
} from './config'
import * as genericFunction from './function'
import * as instance from './instance'

import {
  given,
  // @ts-ignore
  GivenFn
} from './given'
import { isNode } from './isNode'
import { registerPlugin, loadPlugins } from './plugin'
import * as promise from './promise'
import {
  scenario,
  // @ts-ignore
  ScenarioSpec
} from './scenario'
import {
  spec,
  // @ts-ignore
  SpecFn
} from './spec'

export * from './artifact'
export * from './config'
export * from './errors'
export * from './given'
export * from './interfaces'
export * from './scenario'
export * from './spec'
export { registerPlugin }

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

const komondor = {
  config,
  given,
  scenario,
  spec,
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

export default komondor

// order is important, top is generic, bottom is specific.
// registerPlugin(genericObject)
registerPlugin(genericFunction)
registerPlugin(genericClass)
registerPlugin(instance)
registerPlugin(promise)

// istanbul ignore next
if (isNode) {
  loadPlugins()
}
