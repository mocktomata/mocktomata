import { arrayPlugin } from './array';
import { classPlugin } from './class';
import { errorPlugin } from './error';
import { functionPlugin } from './function';
import { instancePlugin } from './instance';
import { nullPlugin } from './null';
import { objectPlugin } from './object';
import { promisePlugin } from './promise';
import { SpecPlugin } from './spec';
import { stringPlugin } from './string';
import { undefinedPlugin } from './undefined';


export const es2015 = {
  name: '@mocktomata/es2015',
  activate({ register }: SpecPlugin.ActivationContext) {
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
