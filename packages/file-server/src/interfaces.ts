import { PluginModule } from '@komondor-lab/plugin'
export type Options = {
  /**
   * Port number the server will run on.
   */
  port: number,

  repository: Repository
}

export type Repository = {
  readSpec(id: string): Promise<string>
  writeSpec(id: string, data: string): Promise<void>
  readScenario(id: string): Promise<string>
  writeScenario(id: string, data: string): Promise<void>
  getPluginList(): Promise<string[]>
  loadPlugin(name: string): Promise<PluginModule>
}
