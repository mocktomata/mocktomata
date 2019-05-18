import { KeyTypes } from 'type-plus';
import { SpecContext } from '../context';
import { NotSpecable } from '../errors';
import { findPlugin } from '../plugin';
import { KomondorPlugin } from '../types';
import { createTimeoutWarning } from './createTimeoutWarning';
import { SpecRecordLive, toSpecRecord } from './SpecRecord';
import { Meta, SpecOptions } from './types';

export function createRecorder(context: SpecContext, id: string, options: SpecOptions) {
  const record: SpecRecordLive = { refs: new Map(), actions: [] }

  const idleWarning = createTimeoutWarning(options.timeout)
  return {
    getSpy<T>(subject: T): T {
      try {
        return getSpy(record, subject)
      }
      catch (e) {
        idleWarning.stop()
        throw e
      }
    },
    async end() {
      idleWarning.stop()
    },
    async save() {
      await this.end()
      return context.io.writeSpec(id, toSpecRecord(record) as any)
    }
  }
}

function getSpy<T>(record: SpecRecordLive, subject: T, source?: any): T {
  const plugin = findPlugin(subject)
  if (!plugin) {
    // this happens if the subject is new langauge feature not supported by the loaded plugins.
    throw new NotSpecable(subject)
  }

  const spyContext = createSpyContext(record, plugin)
  const spy = plugin.getSpy(spyContext, subject)

  return spy
}

export type SpyContext2 = ReturnType<typeof createSpyContext>
// export type ActionRecorder = ReturnType<ReturnType<typeof createSpyContext>['newRecorder']>

function createSpyContext(record: SpecRecordLive, plugin: KomondorPlugin) {
  return {
    newRecorder(stub: any, meta?: Meta) {
      const ref = getRef(record, plugin, stub)
      return {
        construct(args?: any[]) {
          record.actions.push({
            type: 'construct',
            payload: args,
            ref
          })

          return {} as any
        },
        /**
         * @param target The scope. This is usually the stub.
         */
        invoke(args: any[] = []) {
          record.actions.push({
            type: 'invoke',
            payload: args,
            ref
          })

          const spiedArgs = args.map((arg, i) => getSpy(record, arg, { ref, site: [i] }))

          return {
            spiedArgs,
            return(result: any) {
              record.actions.push({
                type: 'return',
                payload: result,
                ref
              })
              return getSpy(record, result)
            },
            throw(error: any) {
              record.actions.push({
                type: 'throw',
                payload: error,
                ref
              })
              return getSpy(record, error)
            }
          }
        },
        get(target: any, prop: KeyTypes) {
          return {} as any
        },
        set(target: any, prop: KeyTypes, value: any) {
          return {} as any
        }
      }
    }
  }
}
function getRef(record: SpecRecordLive, plugin: KomondorPlugin, target: any) {
  if (record.refs.has(target)) {
    return record.refs.get(target)!.ref
  }
  else {
    const ref = String(record.refs.size + 1)
    record.refs.set(target, { plugin, ref })
    return ref
  }
}
