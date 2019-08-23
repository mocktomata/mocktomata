import { SpecContext } from '../context';
import { Spec, SpecOptions } from './types';

export async function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, _options: SpecOptions): Promise<Spec<T>> {

  await context.io.readSpec(id)

  return {
    subject,
    async done() { }
  }
}
