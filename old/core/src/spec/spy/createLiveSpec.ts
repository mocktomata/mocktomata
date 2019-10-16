import { findPlugin, PluginInstance } from '@mocktomata/plugin'
import { NotSpecable } from '../errors';
import { Spec } from '../interfaces';
import { SpecAction } from '../specAction';
import { InvocationContext } from './InvocationContext';

export async function createLiveSpec<T>(subject: T): Promise<Spec<T>> {
  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions: SpecAction[] = []

  const context = new InvocationContext({ actions, instanceIds: {} }, plugin.name)

  return {
    subject: createSpy(context, plugin, subject),
    done() {
      return Promise.resolve()
    }
  }
}

function createSpy(context: any, plugin: PluginInstance, subject: any) {
  return plugin.getSpy(context, subject)
}
