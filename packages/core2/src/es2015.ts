// import { arrayPlugin } from './array';
// import { errorPlugin } from './error';
import { functionPlugin } from './function';
// import { objectPlugin } from './object';
import { SpecPluginActivationContext } from './spec';
// import { promisePlugin } from './promise';
// import { stringPlugin } from './string';

export function activate(context: SpecPluginActivationContext) {
  // context.register(stringPlugin)
  // context.register(objectPlugin)
  // context.register(arrayPlugin)
  context.register(functionPlugin)
  // context.register(errorPlugin)
  // context.register(promisePlugin)
}
