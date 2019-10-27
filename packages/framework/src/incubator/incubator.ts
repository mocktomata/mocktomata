import { createTestHarness, CreateTestHarnessOptions } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensures';
import { testDuo, testSave, testSequence, testSimulate } from './tests';

export const incubator = {
  save: testSave,
  simulate: testSimulate,
  duo: testDuo,
  sequence: testSequence,
  start(options?: CreateTestHarnessOptions) {
    return createTestHarness(options).start()
  },
  ensureDirNotExists,
  ensureFileNotExists
}
