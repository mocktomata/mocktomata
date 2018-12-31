import { Spec } from './interfaces';
import { SavingSpecContext } from './SpecContext';
import { unpartial } from 'unpartial'
import { SpecOptions, defaultSpecOptions } from './SpecOptions';
import { Plugin } from '../plugin';
export async function createSavingSpec<T>({ io, plugin, logger }: SavingSpecContext, id: string, subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const o = unpartial(defaultSpecOptions, options)

  const context = { data: { actions: [] as any } }
  const timeoutHandle = setTimeout(() => {
    logger.warn(`no action for ${o.timeout} ms. Did you forget to call done()?`)
  }, o.timeout)
  timeoutHandle.refresh()

  return {
    subject: createSpy(context, plugin, subject),
    done() {
      return new Promise(a => {
        a(io.writeSpec(id, context.data))
      })
    }
  }
}

function createSpy(context: any, plugin: Plugin, subject: any) {
  return plugin.getSpy(context, subject)
}
