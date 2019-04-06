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
  fs.writeFileSync(path.join(tmp.name, 'package.json'), JSON.stringify({ komondor: expected }))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('load from .komondor.json', () => {
  const tmp = dirSync()

  const expected = { url: 'http://localhost' };
  fs.writeFileSync(path.join(tmp.name, '.komondor.json'), JSON.stringify(expected))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('if .komondor.json is not a valid json, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.komondor.json'), '')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})

test('if .komondor.js is not a valid js, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.komondor.js'), 'abc def')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})


test('if both .komondor.json and .komondor.js exist, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.komondor.json'), '{}')
  fs.writeFileSync(path.join(tmp.name, '.komondor.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/komondor and .komondor.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "komondor": {} }')
  fs.writeFileSync(path.join(tmp.name, '.komondor.json'), '{}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/komondor and .komondor.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "komondor": {} }')
  fs.writeFileSync(path.join(tmp.name, '.komondor.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})
