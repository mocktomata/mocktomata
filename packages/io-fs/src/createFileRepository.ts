import { PluginModule } from '@komondor-lab/plugin';
import path from 'path';
import { getConfig } from './config';
import { createPluginRepository } from './plugin';
import { createScenarioRepository } from './scenario';
import { createSpecRepository } from './spec';

export type Repository = {
  readSpec(id: string): Promise<string>
  writeSpec(id: string, data: string): Promise<void>
  readScenario(id: string): Promise<string>
  writeScenario(id: string, data: string): Promise<void>
  getPluginList(): Promise<string[]>
  loadPlugin(name: string): Promise<PluginModule>
}

export function createFileRepository(cwd: string): Repository {
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
