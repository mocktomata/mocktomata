import { MocktomataIO, SpecNotFound, SpecRecord } from '@mocktomata/framework';
import { createFileRepository } from '@mocktomata/io-fs';
import { context } from './context';

export type CreateIOOptions = {
  cwd: string
}

export function createIO(options?: CreateIOOptions): MocktomataIO {
  const repo = options ?
    context.value.repository = createFileRepository(options.cwd) :
    context.value.repository
  return {
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      try {
        const specStr = await repo.readSpec(title, invokePath)
        return JSON.parse(specStr)
      }
      catch (e) {
        throw new SpecNotFound(title)
      }
    },
    async writeSpec(title: string, invokePath: string, record: SpecRecord) {
      return repo.writeSpec(title, invokePath, JSON.stringify(record))
    },
    async getPluginList() {
      return repo.getPluginList()
    },
    async loadPlugin(name: string) {
      return require(name)
    }
  }
}
