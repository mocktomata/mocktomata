import { getPlugins } from '../plugin';
import { createBypassSpec } from './createBypassSpec';
import { createSavingSpec } from './createSavingSpec';
import { createSimulateSpec } from './createSimulateSpec';
import { IDCannotBeEmpty, NotSpecable } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { Spec, SpecMode } from './interfaces';
import { ready } from '../runtime';

export function createSpec(defaultMode: SpecMode) {
  return async <T>(id: string, subject: T, options = { timeout: 3000 }): Promise<Spec<T>> => {
    const { io, logger } = await ready
    assertSpecID(id)
    const plugin = findSupportingPlugin(subject)

    const mode = getEffectiveSpecMode(id, defaultMode)
    switch (mode) {
      case 'live':
        return createBypassSpec(id, subject)
      case 'save':
        return createSavingSpec({ plugin, io, logger }, id, subject, options)
      case 'simulate':
        return createSimulateSpec({ plugin, io }, id, subject)
    }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new IDCannotBeEmpty()
}

function findSupportingPlugin(subject: any) {
  const plugins = getPlugins()
  const plugin = plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  return plugin
}
