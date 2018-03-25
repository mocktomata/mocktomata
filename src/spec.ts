import { Spec } from './interfaces'
import { createSpecSimulate, createSpecSave, createSpeclive } from './specInternal'

export interface SpecFn {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
  save<T>(id: string, subject: T): Promise<Spec<T>>
  simulate<T>(id: string, subject: T): Promise<Spec<T>>
}

export const spec = Object.assign(
  createSpeclive(),
  {
    save: createSpecSave(),
    simulate: createSpecSimulate()
  }) as SpecFn
