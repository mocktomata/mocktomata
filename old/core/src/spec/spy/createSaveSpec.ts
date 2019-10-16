import { findPlugin, PluginInstance } from '@mocktomata/plugin';
import { unpartial } from 'unpartial';
import { NotSpecable } from '../errors';
import { Spec } from '../interfaces';
import { SpecAction } from '../specAction';
import { SpySpecContext } from '../SpecContext';
import { defaultSpecOptions, SpecOptions } from '../SpecOptions';
import { InvocationContext } from './InvocationContext';

export async function createSaveSpec<T>({ io, log }: SpySpecContext, id: string, subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const o = unpartial(defaultSpecOptions, options)

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const actions: SpecAction[] = []

  const ic = new InvocationContext({ actions, instanceIds: {} }, plugin.name)
  const timeoutHandle = setTimeout(() => {
    log.warn(`no action for ${o.timeout} ms. Did you forget to call done()?`)
  }, o.timeout)
  timeoutHandle.refresh()

  return {
    subject: createSpy(ic, plugin, subject),
    done() {
      console.log(actions)
      return new Promise(a => {
        a(io.writeSpec(id, { actions }))
      })
    }
  }
}

function createSpy(context: any, plugin: PluginInstance, subject: any) {
  return plugin.getSpy(context, subject)
}
