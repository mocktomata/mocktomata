import { Mocktomata, SpecNotFound, SpecPlugin, SpecRecord } from '@mocktomata/framework'
import { pick, required } from 'type-plus'
import { buildUrl } from './buildUrl'
import { getServerInfo } from './getServerInfo'
import { CreateIOOptions } from './types'
import { Context } from './typesInternal'

export async function createIOInternal({ fetch, location }: Context, options?: CreateIOOptions): Promise<Mocktomata.IO> {
  const info = await getServerInfo({ fetch, location }, options)
  return {
    async getConfig() {
      const url = buildUrl(info.url, `config`)
      const response = await fetch(url)
      const config = await response.json() as Mocktomata.Config
      return required({ plugins: [] }, pick(config, 'overrideMode', 'filePathFilter', 'specNameFilter', 'plugins'))
    },
    async loadPlugin(name: string): Promise<SpecPlugin.Module> {
      return import(name)
    },
    async readSpec(specName: string, specRelativePath: string): Promise<SpecRecord> {
      const id = btoa(JSON.stringify({ specName, specRelativePath }))
      const response = await fetch(buildUrl(info.url, `specs/${id}`))
      if (response.status === 404) {
        throw new SpecNotFound(id, specRelativePath)
      }
      return response.json()
    },
    async writeSpec(specName: string, specRelativePath: string, record: SpecRecord) {
      const id = btoa(JSON.stringify({ specName, specRelativePath }))
      const response = await fetch(buildUrl(info.url, `specs/${id}`), { method: 'POST', body: JSON.stringify(record) })
      // istanbul ignore next
      if (!response.ok) {
        throw new Error(`failed to write spec: ${response.statusText}`)
      }
    },
  }
}
