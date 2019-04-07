import path from 'path';
import { getConfig } from './config';
import { createScenarioRepository } from './scenario';
import { createSpecRepository } from './spec';
import { createPluginRepository } from './plugin';

export function createFileRepository(cwd: string) {
  const config = getConfig(cwd)
  const komondorFolder = path.resolve(cwd, config.komondorFolder)
  const spec = createSpecRepository(komondorFolder)
  const scenario = createScenarioRepository(komondorFolder)
  const plugin = createPluginRepository({ cwd, config })
  return {
    ...spec,
    ...scenario,
    ...plugin
  }
}
