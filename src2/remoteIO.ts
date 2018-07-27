import fetch from 'cross-fetch'

import { SpecRecord, RemoteOptions } from './interfaces'

export function createRemoteIO(options: RemoteOptions = { baseUrl: 'http://localhost:7866' }) {
  // TODO authentication and authorization
  return {
    readSpec(id: string) {
      return fetch.get(createSpecURL(options, id))
    },
    writeSpec(id: string, record: SpecRecord) {
      return fetch.post(createSpecURL(options, id), { method: 'POST', body: JSON.stringify(record) })
    },
    readScenario(id: string) {
      return fetch.get(createScenarioURL(options, id))
    },
    writeScenario(id: string, record) {
      return fetch.post(createScenarioURL(options, id), { method: 'POST', body: JSON.stringify(record) })
    }
  }
}

function createSpecURL(options, id) {
  return `${options.baseUrl}/spec/${id}`
}
function createScenarioURL(options, id) {
  return `${options}/scenario/${id}`
}
