import path from 'path'
import { loadConfig } from './config'
import { MOCKTOMATA_FOLDER, SPEC_FOLDER } from './constants'
import { findInstalledPlugins, loadPlugin } from './plugin'
import { readSpec, writeSpec } from './spec'

export class FileRepository {
  cwd: string
  specFolder: string
  constructor(options: FileRepository.Options) {
    this.cwd = options.cwd
    this.specFolder = path.join(this.cwd, MOCKTOMATA_FOLDER, SPEC_FOLDER)
  }
  loadConfig() {
    return loadConfig(this.cwd)
  }
  /**
   * Find installed plugins.
   * Note that this finds the plugin packages by package.json keywords.
   * If the package's main is not the plugin module,
   * you need to adjust the id accordingly.
   * i.e. this is mostly used to show user what's installed.
   */
  findInstalledPlugins() {
    return findInstalledPlugins(this.cwd)
  }
  /**
   * @returns plugin module.
   */
  loadPlugin(id: string) {
    return loadPlugin(this.cwd, id)
  }
  readSpec(specName: string, relativeInvokePath: string) {
    return readSpec(this.specFolder, specName, relativeInvokePath)
  }
  writeSpec(specName: string, relativeInvokePath: string, data: string) {
    return writeSpec(this.specFolder, specName, relativeInvokePath, data)
  }
}

export namespace FileRepository {
  export type Options = {
    cwd: string
  }
}
