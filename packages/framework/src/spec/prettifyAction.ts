import { tersify } from 'tersify';
import { Recorder } from './recorder';
import { ActionId, GetAction, InvokeAction, ReturnAction, SpecAction, ThrowAction } from './types';

export namespace prettifyAction {
  export type Options = OptionsForGetInvoke | OptionsForReturnThrow
  export type OptionsForGetInvoke = {
    actionId: ActionId, action: GetAction | InvokeAction
  }
  export type OptionsForReturnThrow = {
    actionId: ActionId, action: ReturnAction | ThrowAction, sourceId: ActionId
  }
}

export function prettifyAction({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, actionId: ActionId, action: SpecAction) {
  switch (action.type) {
    case 'get':
      return `${plugin} get (act:${actionId}): (ref:${action.ref}).${action.site.join('.')}${action.payload === undefined ? '' : ` -> ${tersify(action.payload)}`} `
    case 'invoke':
      return `${plugin} invoke (act:${actionId}): (ref:${action.ref})(${action.payload.map(arg => tersify(arg)).join(',')})`
    case 'return':
    case 'throw':
      return `${plugin} ${action.type} (act:${actionId}): (ref:${action.ref} act:${id}) -> ${tersify(action.payload)} `
  }
}
