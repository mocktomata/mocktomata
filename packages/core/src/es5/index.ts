import { PluginActivationContext } from '../plugin';
import { functionPlugin } from './function';
import { stringPlugin } from './string';
import { objectPlugin } from './object';
import { errorPlugin } from './error';

export function activate(context: PluginActivationContext) {
  context.register(stringPlugin)
  context.register(objectPlugin)
  context.register(functionPlugin)
  context.register(errorPlugin)
}
