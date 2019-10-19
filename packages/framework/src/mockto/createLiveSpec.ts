import { Spec } from './types';

export async function createLiveSpec(): Promise<Spec> {
  return Object.assign(
    (subject: any) => subject, {
    async done() { }
  })
}
