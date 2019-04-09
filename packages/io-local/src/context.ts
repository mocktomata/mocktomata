import { createFileRepository, Repository } from '@komondor-lab/io-fs';
import { createStore } from 'global-store';

export type Context = {
  repository: Repository
}
const defaultContext: Context = {
  repository: createFileRepository(process.cwd())
}

export const context = createStore<Context>('@komondor-lab/io-local/context', defaultContext)
