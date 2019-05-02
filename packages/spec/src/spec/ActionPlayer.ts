import { tersify } from 'tersify';
import { KeyTypes, reduceKey, RequiredPick } from 'type-plus';
import { SpecContext } from '../context';
import { NotSpecable, SimulationMismatch } from '../errors';
import { log } from '../log';
import { findPlugin } from '../plugin';
import { isMismatchAction } from './isMismatchAction';
import { loadActions } from './loadActions';
import { Meta, SourceInfo, SpecAction, SubjectInfo } from './types';

export async function createActionPlayer<T>(context: SpecContext, id: string, subject: T) {
  const stubMap = new Map()
  const receivedActions: SpecAction[] = []
  const loadedActions = await loadActions(context, id)

  return {
    stub: createStub({ id, receivedActions, loadedActions, stubMap }, subject),
    end() {
      if (loadedActions.length > receivedActions.length) {
        throw new SimulationMismatch(id, loadedActions[receivedActions.length])
      }
    }
  }
}

type PlayerContext = {
  id: string,
  receivedActions: SpecAction[],
  loadedActions: SpecAction[],
  stubMap: Map<any, any>
}

function createStub<T>(context: PlayerContext, subject: T, sourceInfo?: SourceInfo): T {
  const { stubMap } = context
  if (stubMap.has(subject)) {
    return stubMap.get(subject)
  }

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const stubContext = createStubContext(context, subject, plugin.name, sourceInfo)
  const stub = plugin.getStub(stubContext, subject)
  if (stubContext.subjectInfo) {
    context.stubMap.set(subject, {
      stub,
      subjectInfo: stubContext.subjectInfo,
      sourceInfo
    })
  }
  return stub
}

export type ActionPlayer = {
  /**
   * Records a `new target()` has been called.
   * @param args
   */
  construct(args?: any[]): any,
  invoke(args?: any[]): ReturnType<typeof createStubCallPlayer>,
  get(prop: KeyTypes): ReturnType<typeof createStubGetterPlayer>,
  set(prop: KeyTypes, value: any): ReturnType<typeof createStubSetterPlayer>
}

// type ActionPlayer = PromiseValue<ReturnType<typeof createActionPlayer>>

function createStubContext(context: PlayerContext, subject: any, plugin: string, source?: SourceInfo) {
  const subjectInfo = context.stubMap.has(subject) ?
    context.stubMap.get(subject)!.subjectInfo :
    { plugin, subjectId: context.stubMap.size + 1 }
  let invokeId = 0
  return {
    newPlayer(meta?: Meta) {
      this.subjectInfo = subjectInfo
      return {
        construct(args?: any[]) {
          subjectInfo.instanceId = subjectInfo.instanceId ? subject.instanceId + 1 : 1
          return createStubInstancePlayer(context, subjectInfo, source, args)
        },
        invoke(args: any[]) {
          return createStubCallPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, source, args)
        },
        get(prop: KeyTypes) {
          return createStubGetterPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, source!, prop)
        },
        set(prop: KeyTypes, value: any) {
          return createStubSetterPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, source!, prop, value)
        }
      }
    }
  } as { subjectInfo?: SubjectInfo, newPlayer(meta?: Meta): ActionPlayer }
}
function createStubInstancePlayer(context: PlayerContext, subject: SubjectInfo, source?: SourceInfo, args?: any[]) {
  context.receivedActions.push({
    name: 'construct',
    subject,
    source,
    payload: args
  })
  return {
    stubbedArgs: createStubbedArgs(context, args, subject)
  }
}
function createStubCallPlayer(context: PlayerContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source?: SourceInfo, args?: any[]) {
  const { receivedActions, loadedActions } = context
  const actual: SpecAction = {
    name: 'invoke',
    subject,
    source,
    payload: args
  }

  log.onDebug(() => `invoke: ${tersifyAction(actual)}`)

  validateAction(context, actual)
  receivedActions.push(actual)

  const stubbedArgs = createStubbedArgs(context, args, subject)
  const nextAction = loadedActions[receivedActions.length]

  console.log('next', nextAction, context.stubMap)
  return {
    stubbedArgs,
    succeed() {
      return nextAction.name === 'return'
    },
    result() {
      receivedActions.push(nextAction)
      return createStub(context, nextAction.payload)
    },
    thrown() {
      receivedActions.push(nextAction)
      return createStub(context, nextAction.payload)
    }
  }
}
function createStubGetterPlayer(context: PlayerContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source: SourceInfo, prop: KeyTypes) { }
function createStubSetterPlayer(context: PlayerContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source: SourceInfo, prop: KeyTypes, value: any) { }

function createStubbedArgs(context: PlayerContext, args: any[] | undefined, subject: SubjectInfo) {
  return args ?
    args.map((arg, i) => createStub(context, arg, { type: 'argument', ...subject, site: [i] })) :
    undefined
}

function validateAction({ id, loadedActions, receivedActions }: PlayerContext, action: SpecAction) {
  const expected = loadedActions[receivedActions.length]
  if (isMismatchAction(action, expected)) {
    throw new SimulationMismatch(id, expected, action)
  }
}

// istanbul ignore next
function tersifyAction(action: SpecAction) {
  return tersify(reduceKey(action, (p, k) => {
    if (k === 'payload') {
      p[k] = tersify(action[k])
    }
    else {
      p[k] = action[k]
    }
    return p
  }, {} as Record<any, any>), { maxLength: Infinity })
}

// function createStubInstance(player: ActionPlayer, plugin: string, args?: any[], meta?: Meta) {
//   const instanceId = player.getNewInstanceId(plugin)
//   player.received({
//     name: 'construct',
//     plugin,
//     instanceId,
//     payload: args,
//     meta
//   })
//   let invokeId = 0
//   return {
//     instanceId,
//     newCall(meta?: Meta) {
//       return createStubCall(player, plugin, instanceId, ++invokeId, meta)
//     }
//   }
// }

// function createStubCall(player: ActionPlayer, plugin: string, instanceId: number, invokeId: number, meta: Meta | undefined) {
//   return {
//     invokeId,
//     invoked(args: any[], meta?: Meta) {
//       player.received({
//         name: 'invoke',
//         plugin,
//         instanceId,
//         invokeId,
//         payload: args,
//         meta
//       })
//     },
//     waitUntilReturn(callback: Function) {
//       player.waitUntil({
//         name: 'return',
//         plugin,
//         instanceId,
//         invokeId,
//         payload: undefined
//       }, callback)
//     },
//     succeed(meta?: Meta) {
//       return player.succeed(meta)
//     },
//     result() {
//       return player.result()
//     },
//     thrown() {
//       return player.result()
//     }
//   }
// }
