import { Mocktomata, SpecNotFound, SpecRecord } from '@mocktomata/framework'
import { FileRepository } from '@mocktomata/io-fs'
import path from 'path'
import { required, pick } from 'type-plus'

export namespace createIO {
  export type Options = {
    cwd: string
  }
}

export function createIO(options?: createIO.Options): Mocktomata.IO {
  const { cwd } = required({ cwd: process.cwd() }, options)
  const repo = new FileRepository({ cwd })
  const config = repo.loadConfig() as Mocktomata.Config

  return {
    async getSpecConfig() {
      return pick(config, 'filePathFilter', 'overrideMode', 'specNameFilter')
    },
    async getPluginList() {
      return config.plugins || []
    },
    async loadPlugin(id: string) {
      return repo.loadPlugin(id)
    },
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      const relative = path.relative(cwd, invokePath)
      try {
        return JSON.parse(repo.readSpec(title, relative))
      }
      catch (e) {
        throw new SpecNotFound(title)
      }
    },
    async writeSpec(title: string, invokePath: string, record: SpecRecord) {
      const relative = path.relative(cwd, invokePath)
      return repo.writeSpec(title, relative, JSON.stringify(record))
    },
  }
}
