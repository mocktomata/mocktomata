import { Spec } from './interfaces'
import { specSimulate, specSave, specLive } from './specInternal'

export interface SpecFn {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
  save<T>(id: string, subject: T): Promise<Spec<T>>
  simulate<T>(id: string, subject: T): Promise<Spec<T>>
}

export const spec = Object.assign(
  specLive,
  {
    save: specSave,
    simulate: specSimulate
  }) as SpecFn
