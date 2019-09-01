import { Spec } from './types';

export async function createLiveSpec(): Promise<Spec> {
  return {
    mock(subject) { return subject },
    async done() { }
  }
}
