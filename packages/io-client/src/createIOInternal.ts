import { MocktomataIO, SpecNotFound, SpecPluginModule, SpecRecord } from '@mocktomata/framework';
import { buildUrl } from './buildUrl';
import { getServerInfo } from './getServerInfo';
import { CreateIOOptions } from './types';
import { Context } from './typesInternal';

export async function createIOInternal({ fetch, location }: Context, options?: CreateIOOptions): Promise<MocktomataIO> {
  const info = await getServerInfo({ fetch, location }, options)
  return {
    async readSpec(specName: string, specRelativePath: string): Promise<SpecRecord> {
      const id = btoa(JSON.stringify({ specName, specRelativePath }))
      const response = await fetch(buildUrl(info.url, `specs/${id}`))
      if (response.status === 404) {
        throw new SpecNotFound(id)
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
    async getPluginList() {
      return info.plugins
    },
    async loadPlugin(name: string): Promise<SpecPluginModule> {
      return import(name)
    },
    // async loadConfig() {
    //   const response = await fetch(createConfigURL(info.url))
    //   return response.text()
    // },
  }
}
