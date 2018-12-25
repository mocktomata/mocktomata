import { loadConfig, readScenario, readSpec, writeScenario, writeSpec } from '@komondor-lab/io-fs';
import { SpecRecord } from './interfaces';

export function createIO() {
  return {
    async readSpec(id: string): Promise<SpecRecord> {
      const specStr = await this.io.readSpec(id)
      return JSON.parse(specStr)
    },
    async writeSpec(id: string, record: SpecRecord) {
      return this.io.writeSpec(id, JSON.stringify(record))
    },
    async readScenario(id: string): Promise<any> {
      const specStr = await this.io.readScenario(id)
      return JSON.parse(specStr)
    },
    async writeScenario(id: string, record: any) {
      return this.io.writeScenario(id, JSON.stringify(record))
    },
    async loadConfig() {
      return Promise.resolve(this.io.loadConfig(process.cwd()))
    },
    // do this instead of `import * as io` so that each object has its own copy,
    // thus tests would not override each other.
    io: { loadConfig, readScenario, readSpec, writeScenario, writeSpec }
  }
}
