import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import path from 'path';
import { dirSync } from 'tmp';
import { loadConfig } from './loadConfig';
import { AmbiguousConfig, InvalidConfigFormat } from '.';

test('no config returns empty object', () => {
  const tmp = dirSync()
  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, {})
})

test('load from package.json', () => {
  const tmp = dirSync()

  const expected = { url: 'http://localhost' };
  fs.writeFileSync(path.join(tmp.name, 'package.json'), JSON.stringify({ mocktomata: expected }))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('load from .mocktomata.json', () => {
  const tmp = dirSync()

  const expected = { url: 'http://localhost' };
  fs.writeFileSync(path.join(tmp.name, '.mocktomata.json'), JSON.stringify(expected))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('if .mocktomata.json is not a valid json, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mocktomata.json'), '')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})

test('if .mocktomata.js is not a valid js, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mocktomata.js'), 'abc def')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})


test('if both .mocktomata.json and .mocktomata.js exist, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mocktomata.json'), '{}')
  fs.writeFileSync(path.join(tmp.name, '.mocktomata.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/mocktomata and .mocktomata.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mocktomata.json'), '{}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/mocktomata and .mocktomata.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "mocktomata": {} }')
  fs.writeFileSync(path.join(tmp.name, '.mocktomata.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})
