import { SpecAction } from './specAction';

export type SpecMode = 'live' | 'save' | 'simulate'

export interface Spec<T> {
  subject: T,
  done(): Promise<void>
}

export type Meta = Record<string, any>

export type SpecRecord = { actions: SpecAction[] }

export type SpecIO = {
  readSpec(id: string): Promise<SpecRecord>,
  writeSpec(id: string, record: SpecRecord): Promise<void>
}
