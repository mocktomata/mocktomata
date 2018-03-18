import { Stream, Writable } from 'stream'
import fetch = require('node-fetch')

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

async function fetchStream(address: string, options?): Promise<Stream> {
  const response = await fetch(address, options)
  if (response.status !== 200) {
    throw new Error(response.statusText)
  }
  return response.body
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
    createWriteStream(id: string): Promise<Writable> {
      return id as any
    },
    createReadStream(id: string): Promise<Stream> {
      return fetchStream(`${url}/${id}`)
    }
  }
}
