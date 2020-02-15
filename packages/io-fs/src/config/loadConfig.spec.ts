import { AmbiguousConfig, InvalidConfigFormat } from '@mocktomata/framework'
import t from 'assert'
import a from 'assertron'
import fs from 'fs'
import path from 'path'
import { dirSync } from 'tmp'
import { loadConfig } from '.'
import { fixturePath } from '../util'

test('no config returns empty object', () => {
  const cwd = dirSync().name
  const actual = loadConfig(cwd)
  t.deepStrictEqual(actual, {})
})

test('load from package.json', () => {
  const cwd = fixturePath('pjson')

  const actual = loadConfig(cwd)
  t.deepStrictEqual(actual, { runtime: { target: 'ES2015' } })
})

test('get empty object if package.json does not have mocktomata config', () => {
  const cwd = fixturePath('pjson-no-config')

  const actual = loadConfig(cwd)
  t.deepStrictEqual(actual, {})
})


test('load from .mockto.config.json', () => {
  const cwd = fixturePath('mjson')

  const actual = loadConfig(cwd)
  t.deepStrictEqual(actual, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
})

test('load from .mockto.config.js', () => {
  const cwd = fixturePath('mjs')

  const actual = loadConfig(cwd)
  t.deepStrictEqual(actual, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
})

test('if .mockto.config.json is not a valid json, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})

test('if .mockto.config.js is not a valid js, throws InvalidConfigFormat', () => {
  const tmp = dirSync()
  const cwd = process.cwd()
  module.paths.unshift(tmp.name)
  try {
    const filepath = path.join(tmp.name, '.mockto.config.js');
    fs.writeFileSync(filepath, 'abc def')
    a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
  }
  finally {
    process.chdir(cwd)
  }
})


test('if both .mockto.config.json and .mockto.config.js exist, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '{}')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json and .mockto.config.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '{}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json and .mockto.config.js, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})
