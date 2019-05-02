import { IO } from '../io';
import { PluginNotFound } from '@komondor-lab/plugin';
import { ScenarioNotFound } from '../scenario';
import { SpecNotFound } from '../spec';

export function createInMemoryIO(): IO {
  return {
    async getPluginList() {
      return []
    },
    async loadPlugin(name: string) {
      throw new PluginNotFound(name)
    },
    async readScenario(id) {
      throw new ScenarioNotFound(id)
    },
    async readSpec(id) {
      throw new SpecNotFound(id)
    },
    async writeSpec(id, record) {
      throw new Error()
    },
    async writeScenario(id, record) {
      throw new Error()
    }
  }
}
