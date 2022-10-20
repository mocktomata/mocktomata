import { Mocktomata, SpecNotFound, SpecRecord } from '@mocktomata/framework'
import { FileRepository } from '@mocktomata/nodejs'
import path from 'path'

export namespace createIO {
  export type InternalContext = {
    cwd: string
  }
}

export function createIO({ cwd }: createIO.InternalContext = { cwd: process.cwd() }): Mocktomata.IO {
  const repo = new FileRepository({ cwd })
  return {
    async getConfig() {
      return repo.loadConfig()
    },
    async loadPlugin(id: string) {
      return repo.loadPlugin(id)
    },
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      const relative = path.relative(cwd, invokePath)
      try {
        return JSON.parse(repo.readSpec(title, relative))
      }
      catch (e: any) {
        throw new SpecNotFound(title, invokePath)
      }
    },
    async writeSpec(title: string, invokePath: string, record: SpecRecord) {
      const relative = path.relative(cwd, invokePath)
      return repo.writeSpec(title, relative, JSON.stringify(record))
    },
  }
}
