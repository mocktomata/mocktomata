import cp, { ChildProcess } from 'child_process'
import Hashids from 'hashids'
import path from 'path'

import { SpecNotFound, ScenarioNotFound, SpecRecord } from '.'

let service: ChildProcess
export class RecordClient {
  private requests = {}
  startService(dir?: string) {

    // istanbul ignore next
    if (!service) {
      service = cp.fork(path.join(__dirname, '../dist-es2015/RecordService.js'), dir ? [dir] : undefined)
    }

    service.on('message', response => {
      if (response.error)
        this.requests[response.id].reject(toError(response.error))
      else
        this.requests[response.id].resolve(response.result)
    })
  }
  getSpec(specId: string) {
    const { defer, promise } = createDefer()
    const id = createNewId()
    this.requests[id] = defer
    service.send({ name: 'getSpec', id, args: [specId] })
    return promise
  }
  setSpec(specId: string, record: SpecRecord) {
    const { defer, promise } = createDefer()
    const id = createNewId()
    this.requests[id] = defer
    service.send({ name: 'setSpec', id, args: [specId, record] })
    return promise
  }
  getScenario(scenarioId: string) {
    const { defer, promise } = createDefer()
    const id = createNewId()
    this.requests[id] = defer
    service.send({ name: 'getScenario', id, args: [scenarioId] })
    return promise
  }
  setScenario(scenarioId: string, record) {
    const { defer, promise } = createDefer()
    const id = createNewId()
    this.requests[id] = defer
    service.send({ name: 'setScenario', id, args: [scenarioId, record] })
    return promise
  }
}

function toError(error) {
  switch (error.name) {
    case 'SpecNotFound':
      return new SpecNotFound(error.specId, error.reason)
    case 'ScenarioNotFound':
      return new ScenarioNotFound(error.scenarioId)
    // istanbul ignore next
    default:
      return error
  }
}

let hash = new Hashids().encode(new Date().getTime())
let count = 0
function createNewId() {
  return hash + count++
}

function createDefer() {
  let defer
  const promise = new Promise((resolve, reject) => {
    defer = {
      resolve,
      reject
    }
  })
  return { defer, promise }
}
