import { createFileIO } from './fileIO';
import { SpecRecord } from './interfaces';
import { isNode } from 'is-node';
import { createRemoteIO } from './remoteIO';

let actualIO: any
function getIO() {
  return actualIO || (actualIO = isNode ? createFileIO() : createRemoteIO())
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
