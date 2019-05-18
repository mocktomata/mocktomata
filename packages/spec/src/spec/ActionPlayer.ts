import { tersify } from 'tersify';
import { KeyTypes, reduceKey, RequiredPick } from 'type-plus';
import { SpecContext } from '../context';
import { NotSpecable, SimulationMismatch } from '../errors';
import { log } from '../log';
import { findPlugin } from '../plugin';
import { isMismatchAction } from './isMismatchAction';
import { loadActions } from './loadActions';
import { InvokeAction, Meta, SourceInfo, SpecAction, SpecActionBase, SubjectInfo } from './types';

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
  stubMap: Map<any, {
    stub: any,
    subjectInfo: SubjectInfo,
    sourceInfo?: SourceInfo
  }>
}

function createStub<T>(context: PlayerContext, subject: T, sourceInfo?: SourceInfo): T {
  const { stubMap } = context
  if (stubMap.has(subject)) {
    const entry = stubMap.get(subject)!
    return entry.stub
  }

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }

  const stubContext = createStubContext(context, subject, plugin.name, sourceInfo)
  const stub = plugin.getStub(stubContext, subject)
  if (stubContext.subjectInfo) {
    stubMap.set(subject, {
      stub,
      subjectInfo: stubContext.subjectInfo,
      sourceInfo
    })
  }
  return stub
}

export type ActionPlayer = {
  /**
   * indicate should the subject be invoked during stub.
   * This is for internal use.
   * Normal plugins do not invoke subject.
   */
  isSpecSubject: boolean
  /**
   * Records a `new target()` has been called.
   * @param args
   */
  construct(args?: any[]): any,
  invoke(args?: any[]): ReturnType<typeof createStubInvocationPlayer>,
  get(prop: KeyTypes): ReturnType<typeof createStubGetterPlayer>,
  set(prop: KeyTypes, value: any): ReturnType<typeof createStubSetterPlayer>
}

// type ActionPlayer = PromiseValue<ReturnType<typeof createActionPlayer>>

function createStubContext(context: PlayerContext, subject: any, plugin: string, sourceInfo?: SourceInfo) {
  const subjectInfo = context.stubMap.has(subject) ?
    context.stubMap.get(subject)!.subjectInfo :
    { plugin, subjectId: context.stubMap.size + 1 }
  let invokeId = 0
  return {
    newPlayer(meta?: Meta) {
      subjectInfo.meta = meta
      this.subjectInfo = subjectInfo
      log.debug(`new player for: ${tersify(subjectInfo)}`)
      return {
        isSpecSubject: subjectInfo.subjectId === 1,
        construct(args?: any[]) {
          subjectInfo.instanceId = subjectInfo.instanceId ? subjectInfo.instanceId + 1 : 1
          return createStubInstancePlayer(context, subjectInfo, sourceInfo, args)
        },
        invoke(args: any[]) {
          return createStubInvocationPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo, args)
        },
        get(prop: KeyTypes) {
          return createStubGetterPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo!, prop)
        },
        set(prop: KeyTypes, value: any) {
          return createStubSetterPlayer(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo!, prop, value)
        }
      }
    }
  } as { subjectInfo?: SubjectInfo, newPlayer(meta?: Meta): ActionPlayer }
}
function createStubInstancePlayer(context: PlayerContext, subjectInfo: SubjectInfo, sourceInfo?: SourceInfo, args?: any[]) {
  context.receivedActions.push({
    type: 'construct',
    subjectInfo,
    sourceInfo,
    payload: args
  })
  return {
    stubbedArgs: createStubbedArgs(context, args, subjectInfo)
  }
}
function createStubInvocationPlayer(context: PlayerContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo?: SourceInfo, args?: any[]) {
  const { receivedActions } = context
  const actual: SpecAction = {
    type: 'invoke',
    subjectInfo,
    sourceInfo,
    payload: args
  }
  log.onDebug(() => `invoke: ${tersifyAction(actual)}`)

  validateAction(context, actual)
  receivedActions.push(actual)

  const stubbedArgs = createStubbedArgs(context, args, subjectInfo)
  processNextActions(context)

  const nextAction = peekNextAction(context)
  return {
    stubbedArgs,
    succeed() {
      return nextAction.type === 'return'
    },
    return(result: any) {
      receivedActions.push({
        type: 'return',
        subjectInfo,
        payload: result
      })
      return createStub(context, result, { type: 'return', ...subjectInfo })
    },
    throw(error: any) {
      receivedActions.push({
        type: 'throw',
        subjectInfo,
        // source,
        payload: error
      })
      return createStub(context, error, { type: 'throw', ...subjectInfo })
    },
    result() {
      receivedActions.push(nextAction)
      return nextAction.payload
    }
  }
}

function isActionForSubject(action: SpecActionBase, subject: SubjectInfo) {
  return action.subjectInfo.plugin === subject.plugin &&
    action.subjectInfo.subjectId === subject.subjectId &&
    action.subjectInfo.instanceId === subject.instanceId &&
    action.subjectInfo.invokeId === subject.invokeId
}

function createStubGetterPlayer(context: PlayerContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo: SourceInfo, prop: KeyTypes) { }
function createStubSetterPlayer(context: PlayerContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo: SourceInfo, prop: KeyTypes, value: any) { }

function createStubbedArgs(context: PlayerContext, args: any[] | undefined, subjectInfo: SubjectInfo) {
  return args ?
    args.map((arg, i) => createStub(context, arg, { type: 'argument', ...subjectInfo, site: [i] })) :
    undefined
}

function peekNextAction({ loadedActions, receivedActions }: PlayerContext) {
  return loadedActions[receivedActions.length]
}

function processNextActions(context: PlayerContext) {
  const expected = peekNextAction(context)
  if (!expected) {
    return
    // if (invokeAction && invokeAction.name !== 'construct') {
    //   throw new SimulationMismatch(id, undefined, receivedAction)
    // }
    // else {
    //   return
    // }
  }
  log.onDebug(() => `processing: ${tersifyAction(expected)}`)

  // if (this.waitings.length > 0) {
  //   const cb = this.waitings.filter(c => !isMismatchAction(expected, c.action))
  //   cb.forEach(c => {
  //     this.waitings.splice(this.waitings.indexOf(c), 1)
  //     c.callback(expected)
  //   })
  // }

  // if (invokeAction && isReturnAction(invokeAction, expected)) {
  //   log.debug('wait for return action')
  //   return
  // }

  if (isActionWithSource(expected)) {
    log.onDebug(() => `create stub: ${tersifyAction(expected)}`)
    const stub = getSourceStub(context, expected.subjectInfo)
    if (expected.type === 'invoke') {
      log.onDebug(() => `auto invoke: ${tersifyAction(expected)}`)

      // TODO: deserializePayload
      stub(...expected.payload)
      // subject(...expected.payload)
      // invokeAtSite(stub, expected)
    }
  }
}

function validateAction({ id, loadedActions, receivedActions }: PlayerContext, action: SpecAction) {
  const expected = loadedActions[receivedActions.length]
  if (isMismatchAction(action, expected)) {
    throw new SimulationMismatch(id, expected, action)
  }
}

function isActionWithSource<A extends SpecActionBase>(action: A): action is A & RequiredPick<SpecActionBase, 'sourceInfo'> {
  return !!action.sourceInfo
}

function getSourceStub({ stubMap }: PlayerContext, sourceInfo: SubjectInfo) {
  let result: any
  const it = stubMap.values()
  let value = it.next();
  while (!value.done) {
    const { stub, subjectInfo } = value.value
    if (subjectInfo.plugin === sourceInfo.plugin &&
      subjectInfo.subjectId === sourceInfo.subjectId &&
      subjectInfo.instanceId === sourceInfo.instanceId) {
      result = stub
      break;
    }
    value = it.next();
  }
  return result
}

function invokeAtSite(stub: any, expected: InvokeAction) {

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
