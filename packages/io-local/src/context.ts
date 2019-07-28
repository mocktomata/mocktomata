import { createFileRepository, Repository } from '@komondor-lab/io-fs';
import { createStore } from 'global-store';

export type Context = {
  repository: Repository
}

export const context = createStore<Context>({
  moduleName: '@komondor-lab/io-local',
  key: 'context:b0b620d3-ce8f-46d5-93e7-0ea00ed0c059',
  version: '7.0.0',
  initializer: current => ({
    repository: createFileRepository(process.cwd()),
    ...current
  })
})
