import { PluginActivationContext } from '../types';
import { functionPlugin } from './function';
import { primitivePlugin } from './primitive';
import { objectPlugin } from './object';

export function activate(context: PluginActivationContext) {
  context.register(primitivePlugin)
  context.register(objectPlugin)
  context.register(functionPlugin)
}
