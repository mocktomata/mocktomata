import { notDefined } from '../constants';
import { log } from '../log';
import { ValidateRecord } from './createValidateRecord';
import { ReferenceMismatch } from './errors';
import { getPlugin } from './findPlugin';
import { CircularReference, fixCircularReferences } from './fixCircularReferences';
import { logAutoInvokeAction, logCreateStub } from './logs';
import { createPluginStubContext } from './stubing';
import { InstantiateAction, InvokeAction, SpecOptions, SpecReference } from './types';
import { referenceMismatch } from './validations';

export type Simulator = { run(): void }

export function createSimulator(record: ValidateRecord, _options: SpecOptions): Simulator {
  // use `options` to control which simulator to use.
  // currently only one.
  return createSpecImmediateSimulator(record)
}

/**
 * Create a simulator that will instantly perform actions,
 * ignoring action.tick.
 */
function createSpecImmediateSimulator(record: ValidateRecord) {
  return {
    run() {
      const expectedAction = record.getExpectedAction()
      if (!expectedAction) return
      switch (expectedAction.type) {
        case 'invoke':
          processInvoke(record, expectedAction)
          break
        case 'instantiate':
          processInstantiate(record, expectedAction)
          break
        // case 'get':
        //   processGet(record, expectedAction)
        //   break
      }
    }
  }
}

function processInvoke(record: ValidateRecord, expectedAction: InvokeAction) {
  if (expectedAction.mode === 'passive') return
  log.debug('simulator processInvoke() starts', expectedAction)
  // TODO: this is likely not needed because invokeAction.ref can only be ReferenceId,
  // if we don't support getter/setter.
  const refId = record.resolveRefId(expectedAction.ref)
  if (!refId) return

  if (expectedAction.mode === 'plugin-invoked') {
    const origRef = record.getOriginalRef(refId)!
    const plugin = getPlugin(origRef.plugin)
    const ref: SpecReference = { plugin: plugin.name, subject: undefined, source: { ref: expectedAction.ref, site: undefined }, mode: 'plugin-invoked' }
    record.addRef(ref)
    logCreateStub({ plugin: plugin.name, id: refId })

    const circularRefs: CircularReference[] = []
    const context = createPluginStubContext({ record, plugin, ref, refId, circularRefs, currentId: refId })
    ref.testDouble = plugin.createStub(context, undefined, origRef.meta)
    fixCircularReferences(record, refId, circularRefs)
    return
  }

  const ref = record.getRef(refId)
  if (!ref) {
    throw new Error(`simulator.processInvoke can't find reference for ${refId}`)
  }

  // console.log('exp', expectedAction, ref)
  // console.log('expectedAction', expectedAction, record.actual)
  const args = expectedAction.payload.map(arg => {
    if (typeof arg !== 'string') return arg

    const reference = record.getRef(arg)
    if (reference) return reference.testDouble

    const origRef = record.getOriginalRef(arg)
    if (!origRef) {
      throw new Error(`Can't find reference of ${arg}`)
    }

    if (!origRef.source) {
      throw new Error(`no source found for ${arg}`)
    }
    const plugin = getPlugin(origRef.plugin)
    const expectedActionId = record.getNextActionId()
    const ref: SpecReference = {
      plugin: plugin.name,
      subject: undefined,
      testDouble: notDefined,
      source: { ref: expectedActionId, site: undefined },
      mode: origRef.mode
    }
    if (referenceMismatch(ref, origRef)) throw new ReferenceMismatch(record.specId, ref, origRef)
    record.addRef(ref)
    logCreateStub({ plugin: plugin.name, id: arg })

    const circularRefs: CircularReference[] = []
    ref.testDouble = plugin.createStub(
      createPluginStubContext({ record, plugin, ref, refId: arg, circularRefs, currentId: arg }),
      undefined,
      origRef.meta)
    fixCircularReferences(record, arg, circularRefs)
    return ref.testDouble
  })

  logAutoInvokeAction(ref, refId, record.getExpectedActionId(), args)
  // console.log('before auto', record.original)
  // console.log('before auto', record.actual)
  const invokeSubject = getInvokeSubject(ref.testDouble, expectedAction.site)
  invokeSubject(...args)
}

function getInvokeSubject(subject: any, site: Array<string | number> | undefined) {
  if (!site || site.length === 0) return subject
  const methodName = site.pop()!

  const target = site.reduce((p, v) => p[v], subject)
  return target[methodName].bind(target)
}

function processInstantiate(record: ValidateRecord, expectedAction: InstantiateAction) {
  if (expectedAction.mode === 'passive') return

  const classReference = record.getRef(expectedAction.ref)!
  // TODO: get spy/stub from payload
  return new classReference.testDouble(...expectedAction.payload)
}

// function processGet(record: ValidateRecord, action: GetAction) {
//   const refId = record.resolveRefId(action.ref)
//   const ref = record.resolveRef(action.ref)
//   if (ref.specTarget) return
//   const name = record.getSubject(action.payload)
//   logAutoGetAction(ref, refId, record.peekActionId(), name)
//   return ref.target[name]
// }
