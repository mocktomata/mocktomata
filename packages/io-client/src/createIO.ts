import fetch from 'cross-fetch';
import { IOClientOptions, SpecRecord } from './interfaces';

export function createIO(options: IOClientOptions) {
  return {
    async readSpec(id: string) {
      const response = await this.fetch(createSpecURL(options, id))
      return response.json()
    },
    async writeSpec(id: string, record: SpecRecord) {
      const response = await this.fetch(createSpecURL(options, id), { method: 'POST', body: JSON.stringify(record) })
      return response.ok
    },
    async readScenario(id: string) {
      const response = await this.fetch(createScenarioURL(options, id))
      return response.json()
    },
    async writeScenario(id: string, record: any) {
      const response = await this.fetch(createScenarioURL(options, id), { method: 'POST', body: JSON.stringify(record) })
      return response.ok
    },
    async loadConfig() {
      const response = await this.fetch(createConfigURL(options))
      return await response.json()
    },
    fetch
  }
}

function createSpecURL(options: IOClientOptions, id: string) {
  return `${options.url}/komondor/spec/${id}`
}
function createScenarioURL(options: IOClientOptions, id: string) {
  return `${options.url}/komondor/scenario/${id}`
}

function createConfigURL(options: IOClientOptions) {
  return `${options.url}/komondor/config`
}
