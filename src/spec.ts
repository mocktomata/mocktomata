import { Spec } from './interfaces'
import { createSpecSimulate, createSpecSave, createSpecLive } from './specInternal'

export interface SpecFn {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
  save<T>(id: string, subject: T): Promise<Spec<T>>
  simulate<T>(id: string, subject: T): Promise<Spec<T>>
}

export const spec = Object.assign(
  createSpecLive(),
  {
    save: createSpecSave(),
    simulate: createSpecSimulate()
  }) as SpecFn
