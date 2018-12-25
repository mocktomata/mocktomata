import t from 'assert';
import a from 'assertron';
import fs from 'fs';
import path from 'path';
import { dirSync } from 'tmp';
import { loadConfig } from './loadConfig';
import { AmbiguousConfig, InvalidConfigFormat } from '..';

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

test('load from komondor.config.json', () => {
  const tmp = dirSync()

  const expected = { url: 'http://localhost' };
  fs.writeFileSync(path.join(tmp.name, 'komondor.config.json'), JSON.stringify(expected))

  const actual = loadConfig(tmp.name)
  t.deepStrictEqual(actual, expected)
})

test('if komondor.config.json is not a valid json, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'komondor.config.json'), '')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})

test('if komondor.config.js is not a valid js, throws InvalidConfigFormat', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'komondor.config.js'), 'abc def')
  a.throws(() => loadConfig(tmp.name), InvalidConfigFormat)
})


test('if both komondor.config.json and komondor.config.js exist, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'komondor.config.json'), '{}')
  fs.writeFileSync(path.join(tmp.name, 'komondor.config.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/komondor and komondor.config.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "komondor": {} }')
  fs.writeFileSync(path.join(tmp.name, 'komondor.config.json'), '{}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

test('if both package.json/komondor and komondor.config.json, throws AmbiguousConfig', () => {
  const tmp = dirSync()

  fs.writeFileSync(path.join(tmp.name, 'package.json'), '{ "komondor": {} }')
  fs.writeFileSync(path.join(tmp.name, 'komondor.config.js'), 'module.exports={}')
  a.throws(() => loadConfig(tmp.name), AmbiguousConfig)
})

// it('not supported property throws', () => {
//   a.throws(() => loadConfig('fixtures/config/invalid-prop'), ConfigPropertyNotRecognized)
// })

// it(`komondor.plugins must be an array`, () => {
//   a.throws(() => loadConfig('fixtures/config/plugins-as-string'), ConfigPropertyIsInvalid)
// })

// it('plugins is stored', () => {
//   loadConfig('./fixtures/config/single-plugin')
//   t.strictEqual(getConfig().plugins![0], 'komondor-plugin-single')
// })

