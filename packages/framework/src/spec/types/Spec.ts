import { LogLevel } from 'standard-log'
import { SpecRecord } from './SpecRecord'
import { SpecIO } from './SpecIO';
import { SpecPluginModuleIO } from './SpecPluginModule';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO,
}

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
  enableLog(level?: LogLevel): void,
  getSpecRecord(): SpecRecord,
}

export namespace Spec {
  export type Handler<S = Spec> = (specName: string, spec: S) => void | Promise<any>

  export type Mode = 'live' | 'save' | 'simulate' | 'auto'
  export type Options = {
    timeout: number
  }
}
