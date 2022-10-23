import { Log, Mocktomata, PluginModuleNotConforming, SpecNotFound, SpecRecord } from '@mocktomata/framework'
import path from 'node:path'
import { reduceByKey } from 'type-plus'
import { loadConfig } from './config/index.js'
import { MOCKTOMATA_FOLDER, SPEC_FOLDER } from './constants.js'
import { loadPlugin } from './plugin/index.js'
import { readSpec, writeSpec } from './spec/index.js'

export namespace createIO {
  export type Param = {
    cwd: string
  } & Log.Context
}

export function createIO({ cwd, log }: createIO.Param): Mocktomata.IO {
  let specFolder = path.join(cwd, MOCKTOMATA_FOLDER, SPEC_FOLDER)
  return {
    async loadConfig() {
      const [configs, env] = await loadConfig({ cwd })
      const configFilenames = configs.map(c => c[0])
      if (configFilenames.length > 1) {
        log.warn(`Multiple configurations detected.
Please consolidate them into a single config.

configs:
${configFilenames.map(c => `- ${c}`).join('\n')}`)
      }

      const config = trimProps({
        ...configs.reduce((p, v) => {
          const { ecmaVersion, mocktomataDir, plugins, logLevel, ...rest } = v[1] as any
          const extraKeys = Object.keys(rest)
          if (extraKeys.length > 0) {
            log.warn(`Config file '${v[0]}' contains unrecognized properties: ${extraKeys.join(', ')}`)
          }

          return { ...p, ecmaVersion, mocktomataDir, plugins, logLevel }
        }, {} as Record<string, unknown>), ...env[1]
      })

      const logLevel = +(config['logLevel'] as any)
      if (!Number.isNaN(logLevel)) {
        config['logLevel'] = logLevel
      }
      if (config.mocktomataDir) specFolder = path.join(cwd, config.mocktomataDir, SPEC_FOLDER)
      return config
    },
    // istanbul ignore next test through `@unional/fixture`
    async loadPlugin(name: string) {
      const m = await loadPlugin(cwd, name)
      if (typeof m.activate !== 'function') throw new PluginModuleNotConforming(name)
      return m
    },
    async readSpec(title: string, invokePath: string): Promise<SpecRecord> {
      try {
        return JSON.parse(readSpec(specFolder, title, invokePath))
      }
      catch (e: any) {
        throw new SpecNotFound(title, invokePath)
      }
    },
    async writeSpec(title: string, invokePath: string, record: string) {
      return writeSpec(specFolder, title, invokePath, record)
    },
  }
}


function trimProps(value: Record<string, any>) {
  return reduceByKey(value, (p, k) => {
    if (value[k] !== undefined) p[k] = value[k]
    return p
  }, {} as Record<string, any>)
}
