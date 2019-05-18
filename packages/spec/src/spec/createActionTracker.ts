import { tersify } from 'tersify';
import { NotSpecable, SimulationMismatch } from '../errors';
import { log } from '../log';
import { findPlugin } from '../plugin';
import { Meta, SourceInfo, SpecAction, SubjectInfo } from './types';

export type SpecEntry = {
  type: string,
  payload: any,
  meta?: Meta,
}

export type ActionTracker = ReturnType<typeof createActionTracker>

export function createActionTracker(id: string, actions: SpecAction[]) {
  const received: SpecAction[] = []
  const subjectMap = new Map<any, any>()
  return {
    getStub<T>(subject: T, sourceInfo?: SourceInfo): T {

      const plugin = findPlugin(subject)
      if (!plugin) {
        throw new NotSpecable(subject)
      }


      const subjectInfo = subjectMap.has(subject) ?
        subjectMap.get(subject) : { plugin, subjectId: subjectMap.size + 1 }

      const stubContext = createStubContext(this, subjectInfo, sourceInfo)
      const stub = plugin.getStub(stubContext, subject)

      return subject
    },
    end() {
      if (actions.length > received.length) {
        throw new SimulationMismatch(id, actions[received.length])
      }
    }
  }
}


function createStubContext(tracker: ActionTracker, subjectInfo: SubjectInfo, sourceInfo?: SourceInfo) {
  return {
    newPlayer(meta?: Meta) {
      subjectInfo.meta = meta
      log.debug(`new player for: ${tersify(subjectInfo)}`)
      return {} as any
    }
  }
}
