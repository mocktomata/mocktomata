import { KeyTypes } from 'type-plus';
import { context, SpecContext } from '../context';
import { findPlugin, getPlugin } from '../plugin';
import { PluginInstance } from '../plugin/typesInternal';
import { createTimeoutWarning } from './createTimeoutWarning';
import { IDCannotBeEmpty, NotSpecable, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { createSpecRecordTracker, createSpecRecordValidator, SpecRecordTracker, SpecRecordValidator } from './SpecRecord';
import { Meta, Spec, SpecMode, SpecOptions, SpecRecord } from './types';

export function createSpec(defaultMode: SpecMode) {
  return async <T>(id: string, subject: T, options = { timeout: 3000 }): Promise<Spec<T>> => {
    const { io } = await context.get()
    assertSpecID(id)

    const mode = getEffectiveSpecMode(id, defaultMode)
    switch (mode) {
      case 'auto':
        return createAutoSpec({ io }, id, subject, options)
      case 'live':
        return createLiveSpec({ io }, id, subject, options)
      case 'save':
        return createSaveSpec({ io }, id, subject, options)
      case 'simulate':
        return createSimulateSpec({ io }, id, subject, options)
    }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new IDCannotBeEmpty()
}

export async function createAutoSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  try {
    return await createSimulateSpec(context, id, subject, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) {
      return createSaveSpec(context, id, subject, options)
    }
    else {
      throw e
    }
  }
}

export async function createLiveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const recorder = createRecorder(context, id, subject, options)
  return {
    subject: recorder.spy,
    done() {
      return recorder.end()
    }
  }
}

export async function createSaveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const recorder = createRecorder(context, id, subject, options)
  return {
    subject: recorder.spy,
    done() {
      return recorder.save()
    }
  }
}

export async function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const player = await createPlayer(context, id, subject, options)
  return {
    subject: player.stub,
    async done() {
      return player.end()
    }
  }
}

function createRecorder<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (typeof subject === 'string') throw new NotSpecable(subject)

  const plugin = findPlugin(subject)
  if (!plugin) throw new NotSpecable(subject)

  const record: SpecRecord = { refs: [], actions: [] }
  const recordTracker = createSpecRecordTracker(record)

  const spyContext = createSpyContext(recordTracker, plugin, subject, true)
  const spy = plugin.getSpy(spyContext, subject)
  const idleWarning = createTimeoutWarning(options.timeout)
  return {
    spy,
    async end() {
      idleWarning.stop()
    },
    async save() {
      await this.end()
      return context.io.writeSpec(id, makeSerializable(record) as any)
    }
  }
}

function createSpyContext(recordTracker: SpecRecordTracker, plugin: PluginInstance, subject: any, isSubject?: true) {
  return {
    newSpyRecorder(spy: any, meta?: Meta) {
      const ref = recordTracker.getId(plugin.name, spy, isSubject)
      return {
        construct(args: any[] = []) {
          recordTracker.addAction({
            type: 'construct',
            payload: args,
            id: ref
          })

          return {} as any
        },
        /**
         * @param target The scope. This is usually the stub.
         */
        invoke(args: any[] = []) {
          const spiedArgs = args.map((arg, i) => getSpy(recordTracker, arg, { ref, site: [i] }))
          recordTracker.invoke(ref, spiedArgs)

          return {
            spiedArgs,
            return(result: any) {
              const spiedResult = getSpy(recordTracker, result)
              recordTracker.return(ref, spiedResult)
              return spiedResult
            },
            throw(error: any) {
              const spiedError = getSpy(recordTracker, error)
              recordTracker.throw(ref, spiedError)
              return spiedError
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

function getSpy<T>(recordTracker: SpecRecordTracker, subject: T, source?: any): T {
  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const spyContext = createSpyContext(recordTracker, plugin, subject)
  const spy = plugin.getSpy(spyContext, subject)

  return spy
}

function makeSerializable(record: SpecRecord): SpecRecord {
  return {
    refs: record.refs.map(ref => {
      const plugin = getPlugin(ref.plugin)!
      if (plugin.serialize) {
        return {
          ...ref,
          target: plugin.serialize(ref.target)
        }
      }
      else {
        return ref
      }
    }),
    actions: record.actions
  }
}

async function createPlayer<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (typeof subject === 'string') throw new NotSpecable(subject)

  const plugin = findPlugin(subject)
  if (!plugin) throw new NotSpecable(subject)

  const record: SpecRecord = { refs: [], actions: [] }
  const actual = await context.io.readSpec(id)
  const recordValidator = createSpecRecordValidator(id, actual, record)
  const stubContext = createStubContext(recordValidator, plugin, subject)
  const stub = plugin.getStub(stubContext, subject)

  return {
    stub,
    async end() {
      return
    }
  }
}

function createStubContext(recordValidator: SpecRecordValidator, plugin: PluginInstance, subject: any) {
  return {
    newStubRecorder(stub: any, meta?: Meta) {
      const ref = recordValidator.getId(plugin.name, stub)
      return {
        invoke(args: any[] = []) {
          const spiedArgs = args.map(arg => getSpy(recordValidator, arg))
          recordValidator.invoke(ref, spiedArgs)
          processNextActions(recordValidator)
          return {
            succeed() {
              return recordValidator.succeed()
            },
            return() {
              return recordValidator.return()
            },
            throw() {
              return recordValidator.throw()
            }
          }
        }
      }
    }
  }
}

function processNextActions(recordValidator: SpecRecordValidator) {
  const next = recordValidator.peekNextAction()
  if (recordValidator.isSubject(next.id)) return

  const ref = recordValidator.getRef(next.id)
  const plugin = getPlugin(ref.plugin)!
  const target = recordValidator.getTarget(next.id)
  switch (next.type) {
    case 'invoke':
      plugin.invoke!(target, next.payload.map(x => typeof x === 'string' ? recordValidator.getTarget(x) : x))
      processNextActions(recordValidator)
  }
}
