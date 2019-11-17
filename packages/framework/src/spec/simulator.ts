import { notDefined } from '../constants';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ExtraAction, ExtraReference, PluginNotFound, ReferenceMismatch } from './errors';
import { findPlugin } from './findPlugin';
import { logCreateStub, logRecordingTimeout, logAction } from './logs';
import { createValidatingRecord, ValidatingRecord } from './record';
import { ActionId, ActionMode, GetAction, ReferenceId, SpecAction, SpecOptions, SpecPlugin, SpecRecord, SpecReference, SupportedKeyTypes } from './types';
import { referenceMismatch, siteMismatch } from './validations';

export namespace Simulator {
  export type StubOptions = {
    mode?: ActionMode,
  }
  export type Context = {
    timeTracker: TimeTracker,
    record: ValidatingRecord,
    state?: State
  }
  export type State = {
    plugin: string,
    id: ReferenceId | ActionId,
    site: SupportedKeyTypes[]
  }
}

export function createSimulator(specName: string, expected: SpecRecord, options: SpecOptions) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const record = createValidatingRecord(specName, expected)
  const context = { record, timeTracker }

  return {
    createStub: <S>(subject: S, options: Simulator.StubOptions) => createStub(context, subject, options),
    end() {
      timeTracker.stop()
    },
    getSpecRecord(): SpecRecord {
      return record.getSpecRecord()
    }
  }
}
function createStub<S>(context: Simulator.Context, subject: S, options: Simulator.StubOptions) {
  const { record } = context
  const expected = record.getNextExpectedRef()
  if (!expected) throw new ExtraReference(record.specName, subject)

  return createStubInternal(context, expected, subject, options)
}

function createStubInternal(context: Simulator.Context, expected: SpecReference, subject: any, options: Simulator.StubOptions) {
  const { record } = context

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }

  const mode = options.mode || expected.mode
  const source = context.state ? { ref: context.state.id, site: context.state.site } : undefined
  const ref: SpecReference = {
    plugin: plugin.name,
    subject,
    testDouble: notDefined,
    mode,
    source
  }
  if (referenceMismatch(ref, expected)) throw new ReferenceMismatch(record.specName, ref, expected)
  const id = context.record.addRef(ref)
  const state = { id, plugin: plugin.name, site: context.state ? context.state.site : [] }
  logCreateStub(state, mode, expected.meta)
  // const circularRefs: CircularReference[] = []
  ref.testDouble = plugin.createStub(
    createPluginStubContext({ ...context, state }),
    subject,
    expected.meta)
  // fixCircularReferences(record, refId, circularRefs)
  return ref.testDouble
}

function createPluginStubContext(context: Simulator.Context): SpecPlugin.StubContext {
  return {
    getProperty: (property) => getProperty(context, property),
    resolve: (refIdOrValue, options = {}) => resolve(context, refIdOrValue, options),
    getSpy: (subject, getOptions = {}) => getSpy(context, subject, getOptions),
    invoke: (args, invokeOptions = {}) => invocationRecorder(context, args, invokeOptions),
    instantiate: (args, instanceOptions = {}) => instanceRecorder(context, args, instanceOptions)
  }
}
function notGetThenAction(action: SpecAction | undefined) {
  return !(action && action.type === 'get' && action.site.length === 1 && action.site[0] === 'then')
}

function getProperty(context: Simulator.Context, property: SupportedKeyTypes) {
  const { record, timeTracker } = context
  const state = context.state!
  const expected = record.getNextExpectedAction()
  // getProperty calls may be caused by framework access.
  // Those calls will not be record and simply ignored.
  // The one I have indentified is `then` check,
  // probably by TypeScript or async/await for checking if the object is a promise
  if (property === 'then' && notGetThenAction(expected)) return undefined

  const site = [property]
  const action: GetAction = {
    type: 'get',
    ref: state.id,
    payload: undefined,
    site,
    tick: timeTracker.elaspe()
  }

  if (!expected) {
    const actionId = record.getNextActionId()
    // const plugin = record.getRef(state.id)!.plugin

    throw new ExtraAction(record.specName, state, actionId, action)
  }

  // if (true) {
  //   throw new ActionMismatch(record.specName, {}, expected)
  // }

  const refOrValue = expected.payload
  let subject = refOrValue
  let result = refOrValue
  if (typeof refOrValue === 'string') {
    const reference = record.getRef(refOrValue)
    if (reference) {
      return undefined
    }
    else {
      // using `!` because ref is from saved record, so the original reference must exists.
      const origRef = record.getExpectedRef(refOrValue)!
      if (!origRef.source ||
        origRef.source.ref !== state.id ||
        siteMismatch(site, origRef.source.site)
      ) {
        // why not throwing?
        return undefined
      }

      const sourceRef = record.getRef(origRef.source.ref)!
      subject = getByPath(sourceRef.subject, origRef.source.site || [])
      result = createStubInternal({ ...context, state: { ...state, site } }, origRef, subject, {})
    }
  }


  const actionId = record.addAction(action)
  logAction(state, actionId, { ...action, payload: subject })
  return result
}

function resolve(context: Simulator.Context, refIdOrValue: any, options: SpecPlugin.ResolveOptions) {
  return undefined as any
}

function getSpy(context: Simulator.Context, subject: any, options: SpecPlugin.GetSpyOptions) {
  return subject
}

function invocationRecorder(context: Simulator.Context, args: any, options: SpecPlugin.InvokeOptions) {
  const { record, timeTracker } = context
  const state = context.state!
  const expected = record.getNextExpectedAction()


  // const action: Omit<InvokeAction, 'tick'> = {
  //   type: 'invoke',
  //   ref: id,
  //   mode: mode || (ref.mode === 'instantiate' ? 'passive' : ref.mode),
  //   payload: [],
  //   site,
  //   meta
  // }

  return undefined as any
}

function instanceRecorder(context: Simulator.Context, args: any, options: SpecPlugin.InstantiateOptions) {
  return undefined as any
}

function getByPath(subject: any, sitePath: Array<string | number>) {
  if (subject === undefined) return subject
  return sitePath.reduce((p, s) => p[s], subject)
}
