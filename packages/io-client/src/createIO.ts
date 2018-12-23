import fetch from 'cross-fetch';
import { IORemoteOptions, SpecRecord } from './interfaces';

export function createIO(options: IORemoteOptions) {
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
    fetch
  }
}

function createSpecURL(options: IORemoteOptions, id: string) {
  return `${options.url}/spec/${id}`
}
function createScenarioURL(options: IORemoteOptions, id: string) {
  return `${options.url}/scenario/${id}`
}
