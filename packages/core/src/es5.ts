import { arrayPlugin } from './array';
import { errorPlugin } from './error';
import { functionPlugin } from './function';
import { objectPlugin } from './object';
import { PluginActivationContext } from './plugin';
import { stringPlugin } from './string';

export function activate(context: PluginActivationContext) {
  context.register(stringPlugin)
  context.register(objectPlugin)
  context.register(arrayPlugin)
  context.register(functionPlugin)
  context.register(errorPlugin)
}
