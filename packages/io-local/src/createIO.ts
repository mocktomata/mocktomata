import { MocktomataIO, SpecNotFound, SpecRecord } from '@mocktomata/framework'
import { createFileRepository, FileRepositoryOptions } from '@mocktomata/io-fs'
import { required } from 'type-plus'

export type CreateIOOptions = {
  cwd: string,
  repoOptions?: Partial<FileRepositoryOptions>
}

export function createIO(options?: CreateIOOptions): MocktomataIO {
  const { cwd, repoOptions } = required({ cwd: process.cwd() }, options)
  const repo = createFileRepository(cwd, repoOptions)
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
    async writeSpec(title: string, specRelativePath: string, record: SpecRecord) {
      return repo.writeSpec(title, specRelativePath, JSON.stringify(record))
    },
    async getPluginList() {
      return repo.getPluginList()
    },
    async loadPlugin(name: string) {
      return require(name)
    }
  }
}
