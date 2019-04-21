import { createSpec } from './createSpec';
import { Spec, SpecOptions } from './types';

export const spec: SpecFn = Object.assign(
  createSpec('live'), {
    live: createSpec('live'),
    save: createSpec('save'),
    replay: createSpec('replay')
  }
)

export interface SpecFn {
  <T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  live<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  save<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
  replay<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>
}
