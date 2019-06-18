import { NotSpecable } from './errors';
import { SpecRecorder } from './SpecRecorder';
import { SpecOptions } from './types';

export function createSpecRecorder<T>(id: string, subject: T, options: SpecOptions) {
  if (typeof subject !== 'function' && typeof subject !== 'object' && Array.isArray(subject)) throw new NotSpecable(subject)
  return new SpecRecorder(id, subject, options)
}
