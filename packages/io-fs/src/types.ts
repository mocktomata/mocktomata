import { SpecPlugin } from '@mocktomata/framework'

export type Repository = {
  readSpec(specName: string, invokePath: string): Promise<string>,
  writeSpec(specName: string, invokePath: string, data: string): Promise<void>,
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<SpecPlugin.Module>
}

export type FileRepositoryOptions = {
  folder: string,
  /**
   * Specify plugins to load.
   */
  plugins: string[],
}
