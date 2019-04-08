import { createFileRepository } from '@komondor-lab/io-fs';
import { createStore } from 'global-store';
import { Repository } from './interfaces';

export type Context = {
  repository: Repository
}
const defaultContext: Context = {
  repository: createFileRepository(process.cwd())
}

export const context = createStore<Context>('@komondor-lab/file-server/context', defaultContext)
