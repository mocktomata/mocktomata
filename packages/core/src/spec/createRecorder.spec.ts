// import * as es5Module from '../es5/es5'
// import { TestHarness, createTestHarness, loadPlugins } from '..';
// import { createRecorder } from './createRecorder';
// import { SpecOptions } from './types';
// import a from 'assertron'

// let harness: TestHarness
// const options: SpecOptions = { timeout: 10 }
// beforeAll(async () => {
//   harness = createTestHarness()
//   harness.io.addPluginModule('@komondor-lab/es5', es5Module)
//   await loadPlugins(harness)
// })

// afterAll(() => harness.reset())

// test('string has plugin but use as subject throws NotSpecable', () => {
//   a.throws(() => createRecorder(harness, 'string throws NotSpecable', 'some string', options))
// })

// test('new language feature without plugin throws NotSpecable', () => {
//   a.throws(() => createRecorder(harness, 'string throws NotSpecable', Symbol.for('symbol not supported'), options))
// })


test.todo('no tests')
