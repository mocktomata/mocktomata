import { MocktomataIO, ScenarioNotFound, ScenarioRecord, SpecNotFound, SpecPluginModule, SpecRecord } from '@mocktomata/framework';
import { buildUrl } from './buildUrl';
import { getServerInfo } from './getServerInfo';
import { CreateIOOptions } from './types';
import { Context } from './typesInternal';

export async function createIOInternal({ fetch, location }: Context, options?: CreateIOOptions): Promise<MocktomataIO> {
  const info = await getServerInfo({ fetch, location }, options)
  return {
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      const id = btoa(JSON.stringify({ title, invokePath }))
      const response = await fetch(buildUrl(info.url, `specs/${id}`))
      if (response.status === 404) {
        throw new SpecNotFound(id)
      }
      return response.json()
    },
    async writeSpec(title: string, invokePath: string, record: SpecRecord) {
      const id = btoa(JSON.stringify({ title, invokePath }))
      const response = await fetch(buildUrl(info.url, `specs/${id}`), { method: 'POST', body: JSON.stringify(record) })
      // istanbul ignore next
      if (!response.ok) {
        throw new Error(`failed to write spec: ${response.statusText}`)
      }
    },
    async readScenario(id: string) {
      const response = await fetch(buildUrl(info.url, `scenarios/${id}`))
      if (response.status === 404) {
        throw new ScenarioNotFound(id)
      }
      return response.json()
    },
    async writeScenario(id: string, record: ScenarioRecord) {
      const response = await fetch(buildUrl(info.url, `scenarios/${id}`), { method: 'POST', body: JSON.stringify(record) })
      // istanbul ignore next
      if (!response.ok) {
        throw new Error(`failed to write scenario: ${response.statusText}`)
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
