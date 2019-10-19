import { createFileRepository } from '@mocktomata/io-fs';
import path from 'path'

export function createFakeRepository() {
  const cwd = path.resolve(__dirname, '../../fixtures/with-plugin')
  const repo = createFileRepository(cwd)

  const { readScenario, readSpec } = repo

  const specs: Record<string, string> = {
    'exist': '{ "actions": [] }'
  }

  const scenarios: Record<string, string> = {
    'exist': '{ "scenario": "exist" }'
  }
  repo.writeSpec = (id, _invokePath, data) => {
    specs[id] = data
    return Promise.resolve()
  }

  repo.readSpec = (id, invokePath) => {
    if (specs[id]) return Promise.resolve(specs[id])
    return readSpec(id, invokePath)
  }

  repo.writeScenario = (id, data) => {
    scenarios[id] = data
    return Promise.resolve()
  }

  repo.readScenario = id => {
    if (scenarios[id]) return Promise.resolve(scenarios[id])
    return readScenario(id)
  }

  return repo
}
