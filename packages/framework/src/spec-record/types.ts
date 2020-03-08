import { JSONTypes } from 'type-plus'

export type SpecRecord = {
  refs: SpecRecord.Reference[],
  actions: SpecRecord.Action[]
}

export namespace SpecRecord {
  /**
   * Meta data.
   * This is used during spying to save additional information,
   * and use it during stubbing to reproduce the original behavior.
   */
  export type Meta = JSONTypes | undefined
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

    source?: ReferenceSource,
  }
  export type ReferenceId = string

  export type ReferenceSource = PropertySource | ThisSource | ArgumentSource | ResultSource
  export type ArgumentSource = {
    type: 'argument',
    id: ActionId,
    key: number,
  }
  export type PropertySource = {
    type: 'property',
    id: ActionId,
    key: SupportedKeyTypes,
  }

  export type ThisSource = {
    type: 'this',
    id: ActionId,
  }

  export type ResultSource = {
    type: 'result',
    id: ActionId,
  }

  /**
   * Subject profile.
   * Depends on the profile, the default performer of actions are different.
   */
  export type SubjectProfile = 'target' | 'input' | 'output'

  export type Action = GetAction | SetAction | InvokeAction | InstantiateAction | ReturnAction | ThrowAction

  export type CauseActions = GetAction | SetAction | InvokeAction | InstantiateAction
  export type ResultActions = ReturnAction | ThrowAction
  export type Site = ThisSite | ResultSite | PropertySite
  export type ThisSite = { type: 'this' }
  export type PropertySite = {
    type: 'property',
    key: SupportedKeyTypes
  }
  export type ResultSite = { type: 'result' }

  export type GetAction = {
    type: 'get',
    refId: ReferenceId,
    performer: Performer,
    tick: number,
    key: SupportedKeyTypes,
  }

  export type SetAction = {
    type: 'set',
    refId: ReferenceId,
    performer: Performer,
    tick: number,
    key: SupportedKeyTypes,
    /**
     * Value of the set operation.
     * This is the same as the set operation result,
     * but that can be different if the set operation throws an error.
     */
    value: any
  }

  export type InstantiateAction = {
    type: 'instantiate',
    refId: ReferenceId,
    instanceId?: ReferenceId,
    performer: Performer,
    tick: number,
    payload: any[],
    meta?: Meta,
  }

  export type InvokeAction = {
    type: 'invoke',
    refId: ReferenceId,
    performer: Performer,
    tick: number,
    thisArg: any,
    payload: any[],
    site?: SupportedKeyTypes,
    // site?: Site,
    meta?: Meta,
  }

  export type ReturnAction = {
    type: 'return',
    actionId: ActionId,
    tick: number,
    payload: any,
  }

  export type ThrowAction = {
    type: 'throw',
    actionId: ActionId,
    tick: number,
    payload: any,
  }

  export type ActionId = number

  export type Performer = 'user' | 'mockto' | 'plugin'

  /**
   * Key types that works with `komondor`.
   * Note that `symbol` is not supported.
   */
  export type SupportedKeyTypes = string | number
}
