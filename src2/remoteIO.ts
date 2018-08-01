import fetch from 'cross-fetch'

import { SpecRecord, RemoteOptions } from './interfaces'

export function createRemoteIO(options: RemoteOptions = { baseUrl: 'http://localhost:7866' }) {
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
    async writeScenario(id: string, record) {
      const response = await fetch(createScenarioURL(options, id), { method: 'POST', body: JSON.stringify(record) })
      return response.ok
    }
  }
}

function createSpecURL(options, id) {
  return `${options.baseUrl}/spec/${id}`
}
function createScenarioURL(options, id) {
  return `${options}/scenario/${id}`
}
