import { createFileRepository, Repository } from '@mocktomata/io-fs';
import { createStore } from 'global-store';

export type Context = {
  repository: Repository
}

export const context = createStore<Context>({
  moduleName: '@mocktomata/file-server',
  key: 'context:515e574f-70e3-42a5-b354-47ee8d8925d4',
  version: '7.0.0',
  initializer: current => ({ repository: createFileRepository(process.cwd()), ...current })
})
