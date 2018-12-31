import { Spec } from './interfaces';
import { SpecContext } from './SpecContext';
import { SpecOptions } from './SpecOptions';
import { Plugin } from '../plugin'

export async function createSimulateSpec<T>({ io, plugin }: SpecContext, id: string, subject: T, options?: SpecOptions): Promise<Spec<T>> {
  const context = { data: { actions: [] as any } }

  return {
    subject: createStub(context, plugin, subject),
    done() {
      return new Promise(a => {
        a(io.writeSpec(id, context.data))
      })
    }
  }
}

function createStub(context: any, plugin: Plugin, subject: any) {
  return plugin.getStub(context, subject)
}
