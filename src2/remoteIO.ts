import fetch from 'cross-fetch';
import { NotConfigured } from './errors';
import { RemoteOptions, SpecRecord } from './interfaces';
import { store } from './store';

export function createRemoteIO() {
  ensureConfigured()
  const options = store.get().options as RemoteOptions
  // TODO authentication and authorization
  return {
    async readSpec(id: string) {
      const response = await fetch(createSpecURL(options, id))
      return response.json()
    },
    async writeSpec(id: string, record: SpecRecord) {
      const response = await fetch(createSpecURL(options, id), { method: 'POST', body: JSON.stringify(record) })
      return response.ok
    },
    async readScenario(id: string) {
      const response = await fetch(createScenarioURL(options, id))
      return response.json()
    },
    async writeScenario(id: string, record: any) {
      const response = await fetch(createScenarioURL(options, id), { method: 'POST', body: JSON.stringify(record) })
      return response.ok
    }
  }
}

function ensureConfigured() {
  if (!store.get().options.baseUrl) {
    throw new NotConfigured('browser testing', 'remoteOptions.baseUrl')
  }
}

function createSpecURL(options: RemoteOptions, id: string) {
  return `${options.baseUrl}/spec/${id}`
}
function createScenarioURL(options: RemoteOptions, id: string) {
  return `${options.baseUrl}/scenario/${id}`
}
