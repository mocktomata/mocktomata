import fetch from 'cross-fetch';
import { MissingConfigForFeature } from '../config';
import { store } from '../runtime';
import { IOOptions, SpecRecord } from './interfaces';

export function createClientIO() {
  ensureConfigured()
  const options = store.get<IOOptions>('config')
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
  if (!store.get<IOOptions>('config').url) {
    throw new MissingConfigForFeature('browser testing', 'clientOptions.baseUrl')
  }
}

function createSpecURL(options: IOOptions, id: string) {
  return `${options.url}/spec/${id}`
}
function createScenarioURL(options: IOOptions, id: string) {
  return `${options.url}/scenario/${id}`
}
