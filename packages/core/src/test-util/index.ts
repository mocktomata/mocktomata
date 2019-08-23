import { createTestHarness } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensure';
import { testLive, testSave, testSimulate, testTrio } from './komondorTest';

const komondorTest = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio,
  createTestHarness,
  ensureDirNotExists,
  ensureFileNotExists
}

export default komondorTest
export * from './types';
