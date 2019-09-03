import { SpecReference, SpecAction, SpecRecord, ReferenceId, ActionId } from './types';
import { findPlugin } from './findPlugin';
import { PluginNotFound } from './errors';

export function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function findTestDouble<S>(refs: SpecReference[], subject: S): S | undefined {
  const ref = refs.find(r => r.subject === subject)
  return ref && ref.testDouble
}

export function addRef(refs: SpecReference[], ref: SpecReference) {
  return String(refs.push(ref) - 1)
}

export function getRef(record: SpecRecord, ref: ReferenceId | ActionId): SpecReference | undefined {
  const refId = typeof ref === 'string' ? ref : resolveRefId(record, ref)
  return record.refs[Number(refId)]
}

export function findRefId(refs: SpecReference[], testDouble: any) {
  return String(refs.findIndex(r => r.testDouble === testDouble))
}

export function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, ref: ReferenceId | ActionId) {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}

export function getSubject(original: SpecRecord, received: SpecRecord, refOrValue: any) {
  if (typeof refOrValue !== 'string') return refOrValue

  const receivedRef = getRef(received, refOrValue)
  if (receivedRef) return receivedRef.subject

  const origRef = getRef(original, refOrValue)
  return recreateSubject(original, received, origRef)
}

function recreateSubject(original: SpecRecord, received: SpecRecord, ref: SpecReference | undefined) {
  if (ref && ref.meta) {
    const plugin = findPlugin(ref.plugin)
    if (!plugin) throw new PluginNotFound(ref.plugin)

    if (plugin.recreateSubject) {
      return plugin.recreateSubject({ process: (input: any) => getSubject(original, received, input) }, ref.meta)
    }
    return ref.subject
  }
  return undefined
}
