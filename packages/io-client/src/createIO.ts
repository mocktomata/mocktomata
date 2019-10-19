import { MocktomataIO } from '@mocktomata/framework';
import fetch from 'cross-fetch';
import { createIOInternal } from './createIOInternal';
import { CreateIOOptions } from './types';

export async function createIO(options?: CreateIOOptions): Promise<MocktomataIO> {
  return createIOInternal({ fetch, location }, options)
}
