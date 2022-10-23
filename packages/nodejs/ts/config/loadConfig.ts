import fs from 'fs'
import json5 from 'json5'
import path from 'path'
import { MOCKTOMATA_FILE_PATH_FILTER, MOCKTOMATA_LOG_LEVEL, MOCKTOMATA_SPEC_NAME_FILTER } from './constants.js'

export namespace loadConfig {
  export type Context = { cwd: string }
}

type Context = loadConfig.Context

export async function loadConfig(context: loadConfig.Context) {
  return [
    [
      loadFromPackageJson(context),
      ...loadFromJson(context),
    ].filter(Boolean) as Array<[string, unknown]>,
    loadFromEnv(context)
  ] as const
}

function loadFromEnv(_: Context): [string, any] {
  return ['env', reduceOr([
    ['logLevel', process.env[MOCKTOMATA_LOG_LEVEL]],
    ['filePathFilter', process.env[MOCKTOMATA_FILE_PATH_FILTER]],
    ['specNameFilter', process.env[MOCKTOMATA_SPEC_NAME_FILTER]]
  ])]
}

function reduceOr<V>(values: Array<[string, V] | undefined>) {
  const result = values.reduce((p, v) => {
    if (v === undefined) return p
    const value = v[1]
    if (value === undefined) return p
    p[v[0]] = value
    return p
  }, {} as Record<string, unknown>)
  return Object.keys(result).length === 0 ? undefined : result
}

function loadFromPackageJson({ cwd }: Context): [string, any] | undefined {
  const filepath = path.resolve(cwd, 'package.json')
  if (fs.existsSync(filepath)) {
    const pjson = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    if (pjson.mocktomata) return ['package.json', pjson.mocktomata]
  }
  return undefined
}

function loadFromJson({ cwd }: Context): Array<[string, any] | undefined> {
  return ['mocktomata.json'].map(name => {
    const filepath = path.resolve(cwd, name)
    if (fs.existsSync(filepath)) {
      const json = json5.parse(fs.readFileSync(filepath, 'utf-8'))
      return [name, json]
    }
    return undefined
  })
}
