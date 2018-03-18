import { Stream, Writable } from 'stream'
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

function fetchStream(address: string, options?): Stream {
  const stream = new Stream()
  fetch(address, options)
    .then(response => {
      if (response.status !== 200) {
        stream.emit('error', response.statusText)
      }
      else
        stream.emit('data', response.body)
    })
  return stream
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
    createWriteStream(_id: string): Writable {
      throw new Error('not supported yet')
    },
    createReadStream(id: string): Stream {
      return fetchStream(`${url}/${id}`)
    }
  }
}
