import { SpecNotFound, SpecRecord, ScenarioNotFound, ScenarioRecord, IO } from '@komondor-lab/core';
import fetch from 'cross-fetch';
import { buildUrl } from './buildUrl';
import { getServerInfo } from './getServerInfo';
import { CreateIOOptions } from './types';
import { PluginModule } from '@komondor-lab/plugin';

export async function createIO(options?: CreateIOOptions): Promise<IO> {
  const info = await getServerInfo(options)
  return {
    async readSpec(id: string): Promise<SpecRecord> {
      const response = await fetch(buildUrl(info.url, `specs/${id}`))
      if (response.status === 404) {
        throw new SpecNotFound(id)
      }
      return response.json()
    },
    async writeSpec(id: string, record: SpecRecord) {
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
    // async loadConfig() {
    //   const response = await fetch(createConfigURL(info.url))
    //   return response.text()
    // },
    async loadPlugin(name: string): Promise<PluginModule> {
      return import(name)
    }
  }
}
