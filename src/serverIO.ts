import fetch from 'node-fetch'

import { SpecRecord, GivenRecord } from './interfaces'

async function fetchString(address: string, options?): Promise<string> {
  const response = await fetch(address, options)
  if (response.status !== 200) {
    throw new Error(response.statusText)
  }
  return response.text()
}

async function postString(address: string, data: string) {
  return fetch(address, {
    method: 'POST',
    body: data
  })
}

export function getServerIO(url: string) {
  return {
    async readSpec(id: string): Promise<SpecRecord> {
      const result = await fetchString(`${url}/${id}`)
      return JSON.parse(result)
    },
    writeSpec(id: string, record: SpecRecord): Promise<void> {
      const data = JSON.stringify(record)
      return postString(`${url}/${id}`, data)
    },
    writeGiven(id: string, record: GivenRecord): Promise<void> {
      const data = JSON.stringify(record)
      return postString(`${url}/${id}`, data)
    },
    writeScenario(id: string, record): Promise<void> {
      const data = JSON.stringify(record)
      return postString(`${url}/${id}`, data)
    }
  }
}
