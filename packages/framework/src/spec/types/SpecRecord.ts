import { Meta } from './Meta';

// May need to expand this and specialize it for Spy and Stub
export type SpecRecord = {
  refs: SpecRecord.Reference[],
  actions: SpecRecord.Action[]
}

export namespace SpecRecord {
  export type Reference = {
    /**
     * Name of the plugin
     */
    plugin: string,
    profile: SubjectProfile,
    subject?: any,

    testDouble?: any,
    /**
     * Meta data supplied by the plugin.
     */
    meta?: Meta,

    source?: ReferenceSource
  }
  export type ReferenceId = string

  export type ReferenceSource = {
    ref: ReferenceId | ActionId,
    site: SupportedKeyTypes[] | undefined
  }

  /**
   * Subject profile.
   * Depends on the profile, the default performer of actions are different.
   */
  export type SubjectProfile = 'target' | 'input' | 'output'

  export type Action = InvokeAction | InstantiateAction | GetAction | ReturnAction | ThrowAction

  export type InstantiateAction = {
    type: 'instantiate',
    ref: ReferenceId,
    instanceId: ReferenceId,
    performer: Performer,
    tick: number,
    payload: any[],
    meta?: Meta,
  }

  export type InvokeAction = {
    type: 'invoke',
    ref: ReferenceId | ActionId,
    performer: Performer,
    tick: number,
    payload: any[],
    site?: SupportedKeyTypes[],
    meta?: Meta,
  }

  export type ReturnAction = {
    type: 'return',
    ref: ActionId,
    tick: number,
    payload: any,
    meta?: Meta,
  }

  export type ThrowAction = {
    type: 'throw',
    ref: ActionId,
    tick: number,
    payload: any,
    meta?: Meta,
  }

  export type GetAction = {
    type: 'get',
    ref: ReferenceId | ActionId,
    performer: Performer,
    tick: number,
    payload: any,
    site: SupportedKeyTypes[],
  }

  export type ActionId = number

  export type Performer = 'user' | 'mockto' | 'plugin'

  /**
   * Key types that works with `komondor`.
   * Note that `symbol` is not supported.
   */
  export type SupportedKeyTypes = string | number
}
