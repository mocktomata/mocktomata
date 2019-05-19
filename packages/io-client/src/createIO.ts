import { IO } from '@komondor-lab/core';
import fetch from 'cross-fetch';
import { createIOInternal } from './createIOInternal';
import { CreateIOOptions } from './types';

export async function createIO(options?: CreateIOOptions): Promise<IO> {
  return createIOInternal({ fetch, location }, options)
}
