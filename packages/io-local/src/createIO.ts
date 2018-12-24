import * as io from '@komondor-lab/io-fs';
import { SpecRecord } from './interfaces';

export function createIO() {
  return {
    async readSpec(id: string): Promise<SpecRecord> {
      const specStr = await io.readSpec(id)
      return JSON.parse(specStr)
    },
    async writeSpec(id: string, record: SpecRecord) {
      return io.writeSpec(id, JSON.stringify(record))
    },
    async readScenario(id: string): Promise<any> {
      const specStr = await io.readScenario(id)
      return JSON.parse(specStr)
    },
    async writeScenario(id: string, record: any) {
      return io.writeScenario(id, JSON.stringify(record))
    },
    io
  }
}
