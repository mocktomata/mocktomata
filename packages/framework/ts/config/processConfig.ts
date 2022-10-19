import { toLogLevel } from 'standard-log'
import { Log } from '../log/types.js'
import { SpecPlugin } from '../spec-plugin/types.js'
import { Spec } from '../spec/types.js'
import { ConfigHasUnrecognizedProperties, ConfigPropertyInvalid, ConfigPropertyMismatch } from './errors.js'

// TODO: update Spec.Config
export type Config = {
  overrideMode?: Spec.OverrideMode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
} & SpecPlugin.Config & Log.Config

export namespace Config {
  export type Param = {
    configInput: {
      filePath?: string,
      file?: {
        overrideMode?: unknown,
        filePathFilter?: unknown,
        specNameFilter?: unknown,
        ecmaVersion?: unknown,
        plugins?: unknown,
        logLevel?: unknown
      },
      env?: {
        MOCKTOMATA_MODE?: unknown,
        MOCKTOMATA_FILE_FILTER?: unknown,
        MOCKTOMATA_SPEC_FILTER?: unknown,
        MOCKTOMATA_LOG?: unknown
      }
    }
  }

  export type Context = {
    config: Config
  }
}

export function processConfig(param: Config.Param): Config.Context {
  assertNoUnrecognizedProperty(param.configInput.filePath, param.configInput.file)
  return {
    config: {
      logLevel: resolveLogLevel(param),
      ecmaVersion: resolveEcmaVersion(param),
      plugins: resolvePlugins(param),
      filePathFilter: resolveFilePathFilter(param),
      specNameFilter: resolveSpecNameFilter(param),
      overrideMode: resovleOverrideMode(param)
    }
  }
}

function assertNoUnrecognizedProperty(filePath?: string, file?: Record<string, any>) {
  if (!file) return
  const badProps = Object.keys(file).filter(p => ['logLevel', 'ecmaVersion', 'plugins', 'filePathFilter', 'specNameFilter', 'overrideMode'].indexOf(p) < 0)
  if (badProps.length > 0) {
    throw new ConfigHasUnrecognizedProperties(
      filePath!,
      badProps.reduce((p, k) => {
        p[k] = file[k]
        return p
      }, {} as Record<string, any>), { ssf: processConfig })
  }
}

function resolveLogLevel(param: Config.Param) {
  const fileLogLevel = extractLogLevel(param.configInput.file?.logLevel)
  const envLogLevel = extractLogLevel(param.configInput.env?.MOCKTOMATA_LOG)
  if (valuesDefinedButNotMatch(fileLogLevel, envLogLevel)) {
    throw new ConfigPropertyMismatch(
      param.configInput.filePath!,
      'logLevel',
      param.configInput.file!.logLevel!,
      'MOCKTOMATA_LOG',
      param.configInput.env!.MOCKTOMATA_LOG!,
      { ssf: processConfig })
  }
  return fileLogLevel ?? envLogLevel
}

function extractLogLevel(logLevel?: unknown) {
  if (!logLevel) return undefined
  if (typeof logLevel === 'number') {
    if (logLevel < 0) throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: processConfig })
    return logLevel
  }
  if (typeof logLevel !== 'string') throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: processConfig })
  const result = toLogLevel(logLevel)
  if (!result) throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: processConfig })
  return result
}

function resolveEcmaVersion(param: Config.Param) {
  return extractEcmaVersion(param.configInput.file?.ecmaVersion) ?? 'es2015' as const
}

function extractEcmaVersion(input?: unknown) {
  if (!input) return undefined
  if (typeof input !== 'string') throw new ConfigPropertyInvalid('ecmaVersion', input!, { ssf: processConfig })
  const version = input?.toLowerCase()
  if (version !== 'es2015') throw new ConfigPropertyInvalid('ecmaVersion', input!, { ssf: processConfig })
  return version
}

function resolvePlugins(param: Config.Param) {
  const plugins = param.configInput.file?.plugins
  if (!plugins) return []
  if (!Array.isArray(plugins)) throw new ConfigPropertyInvalid('plugins', plugins, { ssf: processConfig })
  return plugins
}

function resolveFilePathFilter(param: Config.Param) {
  const fileValue = extractFilter('filePathFilter', param.configInput.file?.filePathFilter)
  const envValue = extractFilter('filePathFilter', param.configInput.env?.MOCKTOMATA_FILE_FILTER)
  if (valuesDefinedButNotMatch(fileValue, envValue)) {
    throw new ConfigPropertyMismatch(
      param.configInput.filePath!,
      'filePathFilter',
      param.configInput.file!.filePathFilter,
      'MOCKTOMATA_FILE_FILTER',
      param.configInput.env!.MOCKTOMATA_FILE_FILTER,
      { ssf: processConfig })
  }
  const v = fileValue ?? envValue
  return v ? new RegExp(v) : undefined
}

function resolveSpecNameFilter(param: Config.Param) {
  const fileValue = extractFilter('specNameFilter', param.configInput.file?.specNameFilter)
  const envValue = extractFilter('specNameFilter', param.configInput.env?.MOCKTOMATA_SPEC_FILTER)
  if (valuesDefinedButNotMatch(fileValue, envValue)) {
    throw new ConfigPropertyMismatch(
      param.configInput.filePath!,
      'specNameFilter',
      param.configInput.file!.specNameFilter,
      'MOCKTOMATA_SPEC_FILTER',
      param.configInput.env!.MOCKTOMATA_SPEC_FILTER,
      { ssf: processConfig })
  }
  const v = fileValue ?? envValue
  return v ? new RegExp(v) : undefined
}

function extractFilter(name: string, filter?: unknown) {
  if (!filter) return undefined
  if (typeof filter !== 'string') throw new ConfigPropertyInvalid(name, filter, { ssf: processConfig })
  return filter
}

function resovleOverrideMode(param: Config.Param) {
  const fileValue = extractMode(param.configInput.file?.overrideMode)
  const envValue = extractMode(param.configInput.env?.MOCKTOMATA_MODE)
  if (valuesDefinedButNotMatch(fileValue, envValue)) {
    throw new ConfigPropertyMismatch(
      param.configInput.filePath!,
      'overrideMode',
      param.configInput.file!.overrideMode,
      'MOCKTOMATA_Mode',
      param.configInput.env!.MOCKTOMATA_MODE,
      { ssf: processConfig })
  }
  return fileValue ?? envValue
}

function extractMode(value?: unknown) {
  if (!value) return undefined
  if (typeof value !== 'string') throw new ConfigPropertyInvalid('overrideMode', value, { ssf: processConfig })
  if (['save', 'live', 'simulate'].indexOf(value) < 0) throw new ConfigPropertyInvalid('overrideMode', value, { ssf: processConfig })
  return value as Spec.OverrideMode
}

function valuesDefinedButNotMatch(value1: unknown, value2: unknown) {
  return value1 && value2 && value1 !== value2
}
