import { arrayPlugin } from './array';
import { classPlugin } from './class';
import { errorPlugin } from './error';
import { functionPlugin } from './function';
import { objectPlugin } from './object';
import { promisePlugin } from './promise';
import { SpecPluginActivationContext } from './spec';
import { stringPlugin } from './string';
import { undefinedPlugin } from './undefined';

export const es2015 = {
  name: '@mocktomata/es2015',
  activate(context: SpecPluginActivationContext) {
    context.register(undefinedPlugin)
    context.register(stringPlugin)
    context.register(objectPlugin)
    context.register(arrayPlugin)
    context.register(functionPlugin)
    context.register(errorPlugin)
    context.register(promisePlugin)
    context.register(classPlugin)
  }
}
