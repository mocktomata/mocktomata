import { tersify } from 'tersify';
import { Recorder } from './recorder';
import { SpecRecord } from './types';

export namespace prettifyAction {
  export type Options = OptionsForGetInvoke | OptionsForReturnThrow
  export type OptionsForGetInvoke = {
    actionId: SpecRecord.ActionId, action: SpecRecord.GetAction | SpecRecord.InvokeAction
  }
  export type OptionsForReturnThrow = {
    actionId: SpecRecord.ActionId, action: SpecRecord.ReturnAction | SpecRecord.ThrowAction, sourceId: SpecRecord.ActionId
  }
}

export function prettifyAction(state: Pick<Recorder.ActionState, 'ref' | 'actionId'>, actionId: SpecRecord.ActionId, action: SpecRecord.Action) {
  switch (action.type) {
    case 'get':
      return `${state.ref.plugin} get <act:${actionId}>: <ref:${action.ref}>.${action.site.join('.')}${action.payload === undefined ? '' : ` -> ${tersify(action.payload)}`}`
    case 'invoke':
      return `${state.ref.plugin} invoke <act:${actionId}>: <ref:${action.ref}>(${action.payload.map(arg => tersify(arg)).join(',')})`
    case 'return':
    case 'throw':
      return `${state.ref.plugin} ${action.type} <act:${actionId}>: <ref:${action.ref} act:${actionId}> -> ${tersify(action.payload)}`
  }
}
