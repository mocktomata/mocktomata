import { createTestHarness } from './createTestHarness';
import { ensureDirNotExists, ensureFileNotExists } from './ensures';
import { testDuo, testSave, testSequence, testSimulate } from './tests';
import { CreateTestHarnessOptions } from './types';

export const incubator = {
  save: testSave,
  simulate: testSimulate,
  duo: testDuo,
  sequence: testSequence,
  start: (options?: CreateTestHarnessOptions) => createTestHarness(options).start(),
  ensureDirNotExists,
  ensureFileNotExists
}
