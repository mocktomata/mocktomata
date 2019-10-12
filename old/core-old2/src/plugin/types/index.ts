import { PluginModule } from './KomondorPlugin';

export * from './KomondorPlugin';
// export * from './SpyContext';
// export * from './StubContext';

export type PluginIO = {
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<PluginModule>,
}
