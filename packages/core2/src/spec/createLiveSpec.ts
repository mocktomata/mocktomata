import { SpecContext } from '../context';
import { Spec, SpecOptions } from './types';

export async function createLiveSpec<T>(_context: SpecContext, _id: string, subject: T, _options: SpecOptions): Promise<Spec<T>> {
  return {
    subject,
    async done() { }
  }
}
