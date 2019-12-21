import { arrayPlugin } from './array';
import { classPlugin } from './class';
import { errorPlugin } from './error';
import { functionPlugin } from './function';
import { nullPlugin } from './null';
import { objectPlugin } from './object';
import { promisePlugin } from './promise';
import { SpecPluginActivationContext } from './spec';
import { stringPlugin } from './string';
import { undefinedPlugin } from './undefined';


export const es2015 = {
  name: '@mocktomata/es2015',
  activate({ register }: SpecPluginActivationContext) {
    register(undefinedPlugin)
    register(nullPlugin)
    register(stringPlugin)
    register(objectPlugin)
    register(arrayPlugin)
    register(functionPlugin)
    register(errorPlugin)
    register(promisePlugin)
    register(classPlugin)
  }
}
