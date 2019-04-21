export type SpecMode = 'live' | 'save' | 'replay'

export type Spec<T> = {
  subject: T,
  done(): Promise<void>
}

export type Meta = Record<string, any>

export type SpecRecord = { actions: SpecAction[] }

export type SpecIO = {
  readSpec(id: string): Promise<SpecRecord>,
  writeSpec(id: string, record: SpecRecord): Promise<void>
}

export type SpecOptions = {
  timeout: number
}

export type SpecAction = ConstructAction | InvokeAction | ReturnAction | ThrowAction | CallbackConstructAction

export type ConstructAction = {
  name: 'construct',
  plugin: string,
  payload: any[] | undefined,
  meta?: Meta,
  instanceId: number
}

export type InvokeAction = {
  name: 'invoke',
  plugin: string,
  payload: any[],
  meta?: Meta,
  instanceId: number,
  invokeId: number
}

export type ReturnAction = {
  name: 'return',
  plugin: string,
  payload: any,
  meta?: Meta,
  instanceId: number,
  invokeId: number,
  returnType: string,
  returnInstanceId: number
}

export type CallbackConstructAction = {
  name: 'construct-callback',
  plugin: string,
  payload: any[],
  meta?: Meta,
  // TODO validate: instance id is optional because komondor/callback action does not have instanceId
  instanceId: number
  sourceType: string;
  sourceInstanceId: number;
  sourceInvokeId: number;
  sourceSite: (string | number)[];
}

export type ThrowAction = {
  name: 'throw',
  plugin: string,
  payload: any,
  meta?: Meta,
  instanceId: number,
  invokeId: number
}
