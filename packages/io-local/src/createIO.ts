import { MocktomataIO, SpecNotFound, SpecRecord } from '@mocktomata/framework'
import { createFileRepository, FileRepositoryOptions } from '@mocktomata/io-fs'
import { required } from 'type-plus'

export type CreateIOOptions = {
  cwd: string,
  repo?: Partial<FileRepositoryOptions>
}

export function createIO(options?: CreateIOOptions): MocktomataIO {
  const { cwd, repo } = required({ cwd: process.cwd() }, options)
  const repository = createFileRepository(cwd, repo)
  return {
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      try {
        const specStr = await repository.readSpec(title, invokePath)
        return JSON.parse(specStr)
      }
      catch (e) {
        throw new SpecNotFound(title)
      }
    },
    async writeSpec(title: string, specRelativePath: string, record: SpecRecord) {
      return repository.writeSpec(title, specRelativePath, JSON.stringify(record))
    },
    async getPluginList() {
      return repository.getPluginList()
    },
    async loadPlugin(name: string) {
      return require(name)
    }
  }
}
