import { createSpec } from './createSpec';
import { Spec, SpecOptions } from './types';

export const spec: SpecFn = Object.assign(
  createSpec('auto'), {
    live: createSpec('live'),
    save: createSpec('save'),
    simulate: createSpec('simulate')
  }
)

export interface SpecFn {
  <T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  live<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  save<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  simulate<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
}
