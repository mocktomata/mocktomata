import { Spec } from './interfaces';
import { SpecOptions } from './SpecOptions';

export async function createBypassSpec<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>> {
  return {
    subject,
    done() { return Promise.resolve() }
  }
}
