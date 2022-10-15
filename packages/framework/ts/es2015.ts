import { arrayPlugin } from './plugins/array/index.js'
import { classPlugin } from './plugins/class/index.js'
import { errorPlugin } from './plugins/error/index.js'
import { functionPlugin } from './plugins/function/index.js'
import { inertPlugin } from './plugins/inertValue/index.js'
import { instancePlugin } from './plugins/instance/index.js'
import { nullPlugin } from './plugins/null/index.js'
import { objectPlugin } from './plugins/object/index.js'
import { promisePlugin } from './plugins/promise/index.js'
import type { SpecPlugin } from './spec-plugin/types.js'
import { stringPlugin } from './plugins/string/index.js'
import { undefinedPlugin } from './plugins/undefined/index.js'

export const es2015 = {
  name: '@mocktomata',
  activate({ register }: SpecPlugin.ActivationContext) {
    register(inertPlugin)
    register(undefinedPlugin)
    register(nullPlugin)
    register(stringPlugin)
    register(objectPlugin)
    register(functionPlugin)
    register(instancePlugin)
    register(classPlugin)
    register(arrayPlugin)
    register(errorPlugin)
    register(promisePlugin)
  }
}
