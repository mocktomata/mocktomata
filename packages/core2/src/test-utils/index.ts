import { createTestHarness } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensures';
import { testLive, testSave, testSimulate, testTrio } from './tests';

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
