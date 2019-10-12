import { SpecContext } from '../context';
import { NotSpecable } from './errors';
import { isSpecable } from './isSpecable';
import { Spec, SpecOptions } from './types';

export async function createLiveSpec<T>(_context: SpecContext, _id: string, subject: T, _options: SpecOptions): Promise<Spec<T>> {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  return {
    subject,
    async done() { }
  }
}
