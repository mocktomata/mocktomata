import { NotSpecable } from '../errors';
import { findPlugin } from '../../plugin';
import { Spec, SpecOptions } from '../types';
import { createTimeoutWarning } from './createTimeoutWarning';
import { Recorder } from './Recorder';
import { CaptureContext } from './types';

export async function createLiveSpec<T>({ log }: CaptureContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const recorder = new Recorder(plugin.name)

  const idleWarning = createTimeoutWarning(log, options.timeout)
  return {
    subject: plugin.getSpy(recorder, subject),
    done() {
      idleWarning.stop()
      return Promise.resolve()
    }
  }
}
