import { Mocktomata, SpecNotFound, SpecRecord, SpecPlugin } from '@mocktomata/framework'
import { FileRepository } from '@mocktomata/io-fs'
import { required } from 'type-plus'

export type CreateIOOptions = {
  cwd: string
}

export function createIO(options?: CreateIOOptions): Mocktomata.IO {
  const { cwd } = required({ cwd: process.cwd() }, options)
  const repo = new FileRepository({ cwd })

  return {
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      try {
        return JSON.parse(repo.readSpec(title, invokePath))
      }
      catch (e) {
        throw new SpecNotFound(title)
      }
    },
    async writeSpec(title: string, specRelativePath: string, record: SpecRecord) {
      return repo.writeSpec(title, specRelativePath, JSON.stringify(record))
    },
    async getPluginList() {
      const config = repo.loadConfig() as SpecPlugin.Config
      return config.plugins || []
    },
    async loadPlugin(id: string) {
      return repo.loadPlugin(id)
    }
  }
}
