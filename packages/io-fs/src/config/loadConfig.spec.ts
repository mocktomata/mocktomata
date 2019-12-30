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
  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), JSON.stringify(expected))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('if .mocktomata.json is not a valid json, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, '.mockto.config.json'), '')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})

test('if .mocktomata.js is not a valid js, throws InvalidConfigFormat', () => {
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
