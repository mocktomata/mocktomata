import path from 'path';
import { getConfig } from './config';
import { createGetPluginListFn } from './plugin';
import { createScenarioIO } from './scenario';
import { createSpecIO } from './spec';

export function createFileIO(cwd: string) {
  const config = getConfig(cwd)
  const komondorFolder = path.resolve(cwd, config.komondorFolder)
  const specIO = createSpecIO(komondorFolder)
  const scenarioIO = createScenarioIO(komondorFolder)

  return {
    ...specIO,
    ...scenarioIO,
    getPluginList: createGetPluginListFn({ cwd, config })
  }
}
