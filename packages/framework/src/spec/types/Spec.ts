import { LogLevel } from 'standard-log'

export type SpecHandler = (
  specName: string,
  spec: Spec
) => void | Promise<any>

export type SpecOptions = {
  timeout: number
}

export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
  enableLog(level?: LogLevel): void,
  logSpecRecord(): void,
}
