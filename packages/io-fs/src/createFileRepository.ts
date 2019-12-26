import path from 'path'
import { required } from 'type-plus'
import { getConfig } from './config'
import { createPluginRepository } from './plugin'
import { createSpecRepository } from './spec'
import { FileRepositoryOptions, Repository } from './types'

export function createFileRepository(cwd: string, options?: Partial<FileRepositoryOptions>): Repository {
  const config = required(getConfig(cwd), options)
  const mocktomataFolder = path.resolve(cwd, config.folder)
  const spec = createSpecRepository(mocktomataFolder)
  const plugin = createPluginRepository({ cwd, config })
  return {
    ...spec,
    ...plugin
  }
}
