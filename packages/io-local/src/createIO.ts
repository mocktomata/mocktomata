import { SpecIO, ScenarioIO, SpecRecord, SpecNotFound, ScenarioNotFound, SpecPluginModuleIO } from '@mocktomata/framework';
import { createFileRepository } from '@mocktomata/io-fs';
import { context } from './context';

export type CreateIOOptions = {
  cwd: string
}

export function createIO(options?: CreateIOOptions): SpecIO & SpecPluginModuleIO & ScenarioIO {
  const repo = options ?
    context.value.repository = createFileRepository(options.cwd) :
    context.value.repository
  return {
    async readSpec(id: string): Promise<SpecRecord> {
      try {
        const specStr = await repo.readSpec(id)
        return JSON.parse(specStr)
      }
      catch (e) {
        throw new SpecNotFound(id)
      }
    },
    async writeSpec(id: string, record: SpecRecord) {
      return repo.writeSpec(id, JSON.stringify(record))
    },
    async readScenario(id: string): Promise<any> {
      try {
        const specStr = await repo.readScenario(id)
        return JSON.parse(specStr)
      }
      catch (e) {
        throw new ScenarioNotFound(id)
      }
    },
    async writeScenario(id: string, record: any) {
      return repo.writeScenario(id, JSON.stringify(record))
    },
    async getPluginList() {
      return repo.getPluginList()
    },
    async loadPlugin(name: string) {
      return require(name)
    }
  }
}
