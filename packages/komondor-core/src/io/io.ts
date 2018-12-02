
import { isNode } from 'is-node';
import { createFileIO } from './file';
import { SpecRecord } from './interfaces';
import { createClientIO } from './client';

let actualIO: any
function getIO() {
  return actualIO || (actualIO = isNode ? createFileIO() : createClientIO())
}

export const io = {
  get readSpec(): (id: string) => Promise<SpecRecord> {
    return getIO().readSpec
  },
  get writeSpec(): (id: string, record: SpecRecord) => Promise<void> {
    return getIO().writeSpec
  },
  get readScenario(): (id: string) => Promise<any> {
    return getIO().readScenario
  },
  get writeScenario() {
    return getIO().writeScenario
  }
}
