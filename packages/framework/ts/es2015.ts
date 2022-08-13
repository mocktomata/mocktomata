import { arrayPlugin } from './array'
import { classPlugin } from './class'
import { errorPlugin } from './error'
import { functionPlugin } from './function'
import { inertPlugin } from './inertValue'
import { instancePlugin } from './instance'
import { nullPlugin } from './null'
import { objectPlugin } from './object'
import { promisePlugin } from './promise'
import { SpecPlugin } from './spec-plugin'
import { stringPlugin } from './string'
import { undefinedPlugin } from './undefined'

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
