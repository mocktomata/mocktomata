import { createTestHarness } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensures';
import { testDuo, testFree, testLive, testSave, testSimulate, testTrio } from './tests';

export const incubator = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio,
  duo: testDuo,
  free: testFree,
  createTestHarness,
  ensureDirNotExists,
  ensureFileNotExists
}
