import { LogLevel } from 'standard-log'
import { SpecRecord } from './SpecRecord'

export type SpecHandler<S = Spec> = (
  specName: string,
  spec: S
) => void | Promise<any>

export type SpecOptions = {
  timeout: number
}

export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
  enableLog(level?: LogLevel): void,
  getSpecRecord(): SpecRecord,
}
