import { createTestHarness, TestHarness } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensures';
import { testLive, testSave, testSimulate, testTrio, testDuo } from './tests';

const komondorTest = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio,
  duo: testDuo,
  createTestHarness,
  ensureDirNotExists,
  ensureFileNotExists
}

export default komondorTest
export { TestHarness }
