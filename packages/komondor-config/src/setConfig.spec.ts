import t from 'assert';
import a from 'assertron';
import { ConfigPropertyIsInvalid, ConfigPropertyNotRecognized, getConfig } from '.';
import { setConfig } from './setConfig';

afterEach(() => setConfig({ }))

it('not supported property throws', () => {
  a.throws(() => setConfig({ something: 'a' } as any), ConfigPropertyNotRecognized)
})

it(`plugins must be an array`, () => {
  a.throws(() => setConfig({ plugins: 'not-array' } as any), ConfigPropertyIsInvalid)
})

it('plugins is stored', () => {
  setConfig({ plugins: ['komondor-plugin-single'] })
  t.strictEqual(getConfig().plugins![0], 'komondor-plugin-single')
})

