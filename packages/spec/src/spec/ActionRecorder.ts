import { KeyTypes, RequiredPick } from 'type-plus';
import { NotSpecable } from '../errors';
import { findPlugin } from '../plugin';
import { CaptureContext, KomondorPlugin } from '../types';
import { createTimeoutWarning } from './createTimeoutWarning';
import { serializeActions } from './serializeActions';
import { Meta, SourceInfo, SpecAction, SpecOptions, SubjectInfo } from './types';

/*
FunctionExpression
Assignment
ArrowFunctionExpression
MemberExpression
ExpressionStatement
NewExpression
ThrowStatement
Yield
Await
PropertyNode
ObjectExpression
ArrayExpression
*/

export function createActionRecorder<T>(context: CaptureContext, id: string, subject: T, options: SpecOptions) {
  const spyMap = new Map()
  const actions: SpecAction[] = []
  const spy = createSpy({ actions, spyMap }, subject)

  const idleWarning = createTimeoutWarning(options.timeout)
  return {
    actions,
    spy,
    async end() {
      idleWarning.stop()
    },
    async save() {
      await this.end()

      return context.io.writeSpec(id, { actions: serializeActions(actions) })
    }
  }
}

type RecorderContext = {
  actions: SpecAction[],
  spyMap: Map<any, {
    spy: any,
    subjectInfo: SubjectInfo,
    sourceInfo?: SourceInfo
  }>
}

/**
 * @param sourceInfo the information about the source subject referencing the subject.
 * For example the function invoking the callback, or
 * the function returning the value.
 */
function createSpy<T>(context: RecorderContext, subject: T, sourceInfo?: SourceInfo): T {
  const { spyMap } = context
  if (spyMap.has(subject)) {
    const entry = spyMap.get(subject)!
    return entry.spy
  }

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  const spyContext = createSpyContext(context, subject, plugin, sourceInfo)
  const spy = plugin.getSpy(spyContext, subject)
  if (spyContext.subjectInfo) {
    spyMap.set(subject, {
      spy,
      subjectInfo: spyContext.subjectInfo,
      sourceInfo
    })
  }
  return spy
}

export type ActionRecorder = {
  /**
   * Records a `new target()` has been called.
   * @param args
   */
  construct(args?: any[]): any,
  invoke(args?: any[]): ReturnType<typeof createInvocationRecorder>,
  get(prop: KeyTypes): ReturnType<typeof createGetterRecorder>,
  set(prop: KeyTypes, value: any): ReturnType<typeof createSetterRecorder>
}

function createSpyContext(context: RecorderContext, subject: any, plugin: KomondorPlugin, sourceInfo?: SourceInfo) {
  const subjectInfo = context.spyMap.has(subject) ?
    context.spyMap.get(subject)!.subjectInfo :
    { plugin, subjectId: context.spyMap.size + 1 }
  let invokeId = 0
  return {
    newRecorder(meta?: Meta): ActionRecorder {
      subjectInfo.meta = meta
      this.subjectInfo = subjectInfo

      return {
        construct(args?: any[]) {
          // TODO: save spy instance to spyMap
          subjectInfo.instanceId = subjectInfo.instanceId ? subject.instanceId + 1 : 1
          return createInstanceRecorder(context, subjectInfo, sourceInfo, args)
        },
        invoke(args: any[]) {
          return createInvocationRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo, args)
        },
        get(prop: KeyTypes) {
          return createGetterRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo!, prop)
        },
        set(prop: KeyTypes, value: any) {
          return createSetterRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, sourceInfo!, prop, value)
        }
      }
    }
  } as { subjectInfo?: SubjectInfo, newRecorder(meta?: Meta): ActionRecorder }
}

function createInstanceRecorder(context: RecorderContext, subjectInfo: SubjectInfo, sourceInfo?: SourceInfo, args?: any[]) {
  context.actions.push({
    type: 'construct',
    subjectInfo,
    sourceInfo,
    payload: args
  })
  return {
    spiedArgs: createSpiedArgs(context, args, subjectInfo)
  }
}

function createInvocationRecorder(context: RecorderContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo?: SourceInfo, args?: any[]) {
  context.actions.push({
    type: 'invoke',
    subjectInfo,
    sourceInfo,
    payload: args
  })

  const spiedArgs = createSpiedArgs(context, args, subjectInfo)

  return {
    spiedArgs,
    return(result: any) {
      context.actions.push({
        type: 'return',
        subjectInfo,
        // source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subjectInfo })
    },
    throw(error: any) {
      context.actions.push({
        type: 'throw',
        subjectInfo,
        // source,
        payload: error
      })
      return createSpy(context, error, { type: 'throw', ...subjectInfo })
    }
  }
}

function createGetterRecorder(context: RecorderContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo: SourceInfo, prop: KeyTypes) {
  context.actions.push({
    type: 'get',
    subjectInfo,
    sourceInfo,
    payload: prop
  })
  return {
    return(result: any) {
      context.actions.push({
        type: 'return',
        subjectInfo,
        // source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subjectInfo })
    },
    throw(err: any) {
      context.actions.push({
        type: 'throw',
        subjectInfo,
        // source,
        payload: err
      })
      return createSpy(context, err, { type: 'throw', ...subjectInfo })
    }
  }
}

function createSetterRecorder(context: RecorderContext, subjectInfo: RequiredPick<SubjectInfo, 'invokeId'>, sourceInfo: SourceInfo, prop: KeyTypes, value: any) {
  context.actions.push({
    type: 'set',
    subjectInfo,
    sourceInfo,
    payload: { prop, value }
  })
  return {
    return(result: any) {
      context.actions.push({
        type: 'return',
        subjectInfo,
        // source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subjectInfo })
    },
    throw(err: any) {
      context.actions.push({
        type: 'throw',
        subjectInfo,
        // source,
        payload: err
      })
      return createSpy(context, err, { type: 'throw', ...subjectInfo })
    }
  }
}

function createSpiedArgs(context: RecorderContext, args: any[] | undefined, subjectInfo: SubjectInfo) {
  return args ?
    args.map((arg, i) => createSpy(context, arg, { type: 'argument', ...subjectInfo, site: [i] })) :
    undefined
}
