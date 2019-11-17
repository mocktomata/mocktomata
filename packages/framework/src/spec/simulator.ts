import { notDefined } from '../constants';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ExtraReference, PluginNotFound, ReferenceMismatch, ActionMismatch } from './errors';
import { findPlugin } from './findPlugin';
import { logRecordingTimeout, logCreateStub, logGetAction } from './logs';
import { ActionId, ActionMode, ReferenceId, SpecOptions, SpecRecord, SpecReference, SupportedKeyTypes, SpecPlugin, GetAction } from './types';
import { SpecPluginInstance } from './types-internal';
import { createValidatingRecord, ValidatingRecord } from './record';
import { referenceMismatch } from './validations';

export namespace Simulator {
  export type StubOptions = {
    mode?: ActionMode,
  }
  export type Context = {
    timeTracker: TimeTracker,
    record: ValidatingRecord,
    state: State
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
  const state = { id: 0, site: [], plugin: '' }
  const context = { record, timeTracker, state }

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
  const expected = record.getNextExpectedReference()
  if (!expected) throw new ExtraReference(record.specName, subject)

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }
  return createStubInternal(context, plugin, expected, subject, options)
}

function createStubInternal(context: Simulator.Context, plugin: SpecPluginInstance, expected: SpecReference, subject: any, options: Simulator.StubOptions) {
  const { record } = context
  const ref: SpecReference = { plugin: plugin.name, subject, testDouble: notDefined, mode: options.mode }
  if (referenceMismatch(ref, expected)) throw new ReferenceMismatch(record.specName, ref, expected)
  const id = context.record.addRef(ref)
  const state = { ...context.state, id, plugin: plugin.name }
  logCreateStub(state)
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

function getProperty(context: Simulator.Context, property: SupportedKeyTypes) {
  const { record, timeTracker, state } = context
  const expected = record.getNextExpectedAction()
  // getProperty call may be caused by framework access.
  // Those calls will not be record and simply ignored.
  // The one I have indentified is `then` check,
  // probably by TypeScript or async/await for checking if the object is a promise
  if (!expected || expected.type !== 'get' || (expected.site[0] !== property || property === 'then')) {
    return undefined
  }

  const refOrValue = expected.payload

  const action: GetAction = {
    type: 'get',
    ref: state.id,
    payload: refOrValue,
    site: [property],
    tick: timeTracker.elaspe()
  }

  const actionId = record.addAction(action)
  logGetAction({ id: state.id, plugin: state.plugin }, actionId, property, refOrValue)
  return refOrValue
}

function resolve(context: Simulator.Context, refIdOrValue: any, options: SpecPlugin.ResolveOptions) {
  return undefined as any
}

function getSpy(context: Simulator.Context, subject: any, options: SpecPlugin.GetSpyOptions) {
  return undefined as any
}

function invocationRecorder(context: Simulator.Context, args: any, options: SpecPlugin.InvokeOptions) {
  return undefined as any
}

function instanceRecorder(context: Simulator.Context, args: any, options: SpecPlugin.InstantiateOptions) {
  return undefined as any
}
