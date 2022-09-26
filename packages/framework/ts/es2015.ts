import { arrayPlugin } from './array/index.js'
import { classPlugin } from './class/index.js'
import { errorPlugin } from './error/index.js'
import { functionPlugin } from './function/index.js'
import { inertPlugin } from './inertValue/index.js'
import { instancePlugin } from './instance/index.js'
import { nullPlugin } from './null/index.js'
import { objectPlugin } from './object/index.js'
import { promisePlugin } from './promise/index.js'
import type { SpecPlugin } from './spec-plugin/types.js'
import { stringPlugin } from './string/index.js'
import { undefinedPlugin } from './undefined/index.js'

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
