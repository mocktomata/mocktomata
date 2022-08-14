import { toLogLevel } from 'standard-log'
import { log } from '../log.js'
import { Spec } from '@mocktomata/framework'

export type SourceType = 'environment' | 'config()' | 'config'
export function resolveMode(source: SourceType, value: string | undefined): Spec.OverrideMode | undefined {
  if (!value) return undefined
  const mode = value.toLowerCase()
  if (mode === 'live' || mode === 'save') return mode

  log.warn(`invalid value for mode. expecting 'live' or 'save', but received ${value} from ${source}`)
  return undefined
}

export function resolveFilter(value: string | undefined) {
  return value ? String(value) : undefined
}


export function resolveLogLevel(source: SourceType, value: number | string | undefined) {
  if (!value) return undefined
  if (typeof value === 'number') return value
  const level = toLogLevel(value)
  if (level !== undefined) return level

  log.warn(`invalid value for log level. expecting log level name such as 'DEBUG', but received ${value} from ${source}`)
  return undefined
}
