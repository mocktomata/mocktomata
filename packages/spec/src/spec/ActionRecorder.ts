import { KeyTypes, RequiredPick } from 'type-plus';
import { NotSpecable } from '../errors';
import { findPlugin } from '../plugin';
import { CaptureContext } from '../types';
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
  if (context.spyMap.has(subject)) {
    const entry = context.spyMap.get(subject)!
    return entry.spy
  }

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  const spyContext = createSpyContext(context, subject, plugin.name, sourceInfo)
  const spy = plugin.getSpy(spyContext as any, subject)
  if (spyContext.subjectInfo) {
    context.spyMap.set(subject, {
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
  invoke(args?: any[]): ReturnType<typeof createSpyCallRecorder>,
  get(prop: KeyTypes): ReturnType<typeof createSpyGetterRecorder>,
  set(prop: KeyTypes, value: any): ReturnType<typeof createSpySetterRecorder>
}

function createSpyContext(context: RecorderContext, subject: any, plugin: string, source?: SourceInfo) {
  const subjectInfo = context.spyMap.has(subject) ?
    context.spyMap.get(subject)!.subjectInfo :
    { plugin, subjectId: context.spyMap.size + 1 }
  let invokeId = 0
  return {
    newRecorder(meta?: Meta): ActionRecorder {
      this.subjectInfo = subjectInfo
      return {
        construct(args?: any[]) {
          subjectInfo.instanceId = subjectInfo.instanceId ? subject.instanceId + 1 : 1
          return createSpyInstanceRecorder(context, subjectInfo, source, args)
        },
        invoke(args: any[]) {
          return createSpyCallRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, source, args)
        },
        get(prop: KeyTypes) {
          return createSpyGetterRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, source!, prop)
        },
        set(prop: KeyTypes, value: any) {
          return createSpySetterRecorder(context, { ...subjectInfo, invokeId: ++invokeId }, source!, prop, value)
        }
      }
    }
  } as { subjectInfo?: SubjectInfo, newRecorder(meta?: Meta): ActionRecorder }
}

function createSpyInstanceRecorder(context: RecorderContext, subject: SubjectInfo, source?: SourceInfo, args?: any[]) {
  context.actions.push({
    name: 'construct',
    subject,
    source,
    payload: args
  })
  return {
    spiedArgs: createSpiedArgs(context, args, subject)
  }
}

function createSpyCallRecorder(context: RecorderContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source?: SourceInfo, args?: any[]) {
  context.actions.push({
    name: 'invoke',
    subject,
    source,
    payload: args
  })

  const spiedArgs = createSpiedArgs(context, args, subject)

  return {
    spiedArgs,
    return(result: any) {
      context.actions.push({
        name: 'return',
        subject,
        source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subject })
    },
    throw(error: any) {
      context.actions.push({
        name: 'throw',
        subject,
        source,
        payload: error
      })
      return createSpy(context, error, { type: 'throw', ...subject })
    }
  }
}

function createSpyGetterRecorder(context: RecorderContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source: SourceInfo, prop: KeyTypes) {
  context.actions.push({
    name: 'get',
    subject,
    source,
    payload: prop
  })
  return {
    return(result: any) {
      context.actions.push({
        name: 'return',
        subject,
        source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subject })
    },
    throw(err: any) {
      context.actions.push({
        name: 'throw',
        subject,
        source,
        payload: err
      })
      return createSpy(context, err, { type: 'throw', ...subject })
    }
  }
}

function createSpySetterRecorder(context: RecorderContext, subject: RequiredPick<SubjectInfo, 'invokeId'>, source: SourceInfo, prop: KeyTypes, value: any) {
  context.actions.push({
    name: 'set',
    subject,
    source,
    payload: { prop, value }
  })
  return {
    return(result: any) {
      context.actions.push({
        name: 'return',
        subject,
        source,
        payload: result
      })
      return createSpy(context, result, { type: 'return', ...subject })
    },
    throw(err: any) {
      context.actions.push({
        name: 'throw',
        subject,
        source,
        payload: err
      })
      return createSpy(context, err, { type: 'throw', ...subject })
    }
  }
}

function createSpiedArgs(context: RecorderContext, args: any[] | undefined, subject: SubjectInfo) {
  return args ?
    args.map((arg, i) => createSpy(context, arg, { type: 'argument', ...subject, site: [i] })) :
    undefined
}
