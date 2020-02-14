import t from 'assert'
import a from 'assertron'
import fs from 'fs'
import path from 'path'
import { dirSync } from 'tmp'
import { AmbiguousConfig, InvalidConfigFormat, loadConfig } from '.'
import { fixturePath } from '../util'

test('no config returns empty object', async () => {
  const tmp = dirSync()
  const actual = await loadConfig(tmp.name)
  t.deepStrictEqual(actual, {})
})

test('load from package.json', async () => {
  const cwd = fixturePath('pjson')

  const actual = await loadConfig(cwd)
  t.deepStrictEqual(actual, { runtime: { target: 'ES2015' } })
})

test('get empty object if package.json does not have mocktomata config', async () => {
  const cwd = fixturePath('pjson-no-config')

  const actual = await loadConfig(cwd)
  t.deepStrictEqual(actual, {})
})


test('load from .mockto.config.json', async () => {
  const cwd = fixturePath('mjson')

  const actual = await loadConfig(cwd)
  t.deepStrictEqual(actual, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
})

test('load from .mockto.config.js', async () => {
  const cwd = fixturePath('mjs')

  const actual = await loadConfig(cwd)
  t.deepStrictEqual(actual, { plugins: ['@mocktomata/plugin-fixture-dummy'] })
})

test('if .mockto.config.json is not a valid json, throws InvalidConfigFormat', async () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '')
  await a.throws(loadConfig(tmp.name), InvalidConfigFormat)
})

test('if .mockto.config.js is not a valid js, throws InvalidConfigFormat', async () => {
  const tmp = dirSync()
  const cwd = process.cwd()
  module.paths.unshift(tmp.name)
  try {
    const filepath = path.join(tmp.name, '.mockto.config.js');
    fs.writeFileSync(filepath, 'abc def')
    await a.throws(loadConfig(tmp.name), InvalidConfigFormat)
  }
  finally {
    process.chdir(cwd)
  }
})


test('if both .mockto.config.json and .mockto.config.js exist, throws AmbiguousConfig', async () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '{}')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.js'), 'module.exports={}')
  await a.throws(loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json and .mockto.config.json, throws AmbiguousConfig', async () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '{}')
  await a.throws(loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json and .mockto.config.js, throws AmbiguousConfig', async () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.js'), 'module.exports={}')
  await a.throws(loadConfig(tmp.name), AmbiguousConfig)
})
