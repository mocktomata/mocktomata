import { loadConfig, createSpecIO, createScenarioIO } from '@komondor-lab/io-fs';
import { SpecRecord } from './interfaces';

export function createIO({ cwd } = { cwd: process.cwd() }) {
  const spec = createSpecIO({ cwd })
  const scenario = createScenarioIO({ cwd })

  return {
    async readSpec(id: string): Promise<SpecRecord> {
      const specStr = await this._deps.spec.read(id)
      return JSON.parse(specStr)
    },
    async writeSpec(id: string, record: SpecRecord) {
      return this._deps.spec.write(id, JSON.stringify(record))
    },
    async readScenario(id: string): Promise<any> {
      const specStr = await this._deps.scenario.read(id)
      return JSON.parse(specStr)
    },
    async writeScenario(id: string, record: any) {
      return this._deps.scenario.write(id, JSON.stringify(record))
    },
    async loadConfig() {
      return Promise.resolve(this._deps.loadConfig(process.cwd()))
    },
    _deps: { loadConfig, spec, scenario }
  }
}
