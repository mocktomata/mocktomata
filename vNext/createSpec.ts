import { SpecMode } from 'komondor-plugin';
import { InvalidID, MissingSpecID, NotSpecable } from './errors';
import { Spec } from './interfaces';
import { runtime } from './runtime';


export async function createSpec({ io }, specId: string, subject, mode: SpecMode) {
  if (InvalidID.isInvalidID(specId)) {
    throw new InvalidID(specId)
  }
  switch (mode) {
    case 'live':
      return createSpyingSpec(specId, subject)
    case 'save':
      return createSavingSpec({ io }, specId, subject)
    case 'simulate':
      return createStubbingSpec({ io }, specId, subject)
  }
}

async function createSpyingSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  const plugin = runtime.findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  return {} as any
  // const context = new SpyContextImpl({}, 'live', id, plugin)

  // const spec: Spec<T> = {
  //   id,
  //   mode: context.mode,
  //   actions: context.actions,
  //   subject: getSpy(context, plugin, subject),
  //   on(actionType: string, name: string, callback) {
  //     context.on(actionType, name, callback)
  //   },
  //   onAny(callback) {
  //     context.onAny(callback)
  //   },
  //   satisfy(expectation) {
  //     return Promise.resolve().then(() => {
  //       satisfy(spec.actions, expectation)
  //     })
  //   },
  //   done() {
  //     return this.satisfy([])
  //   }
  // }
  // return spec
}

async function createSavingSpec<T>({ io }, id: string, subject: T): Promise<Spec<T>> {
  if (!id)
    throw new MissingSpecID('save')

  const plugin = runtime.findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  return {} as any

  // const context = new SpyContextImpl({}, 'save', id, plugin)

  // const spec: Spec<T> = {
  //   id,
  //   mode: context.mode,
  //   actions: context.actions,
  //   subject: getSpy(context, plugin, subject),
  //   on(actionType: string, name: string, callback) {
  //     context.on(actionType, name, callback)
  //   },
  //   onAny(callback) {
  //     context.onAny(callback)
  //   },
  //   satisfy(expectation) {
  //     return Promise.resolve().then(() => {
  //       satisfy(context.actions, expectation)
  //       // istanbul ignore next
  //       if (!id)
  //         throw new Error('Cannot save spec without options.id.')

  //       return io.writeSpec(id, {
  //         expectation: tersify(expectation, { maxLength: Infinity, raw: true }),
  //         actions: makeSerializableActions(this.actions)
  //       })
  //     })
  //   },
  //   done() {
  //     return this.satisfy([])
  //   }
  // }
  // return spec
}

async function createStubbingSpec<T>({ io }, id: string, subject: T): Promise<Spec<T>> {
  if (!id)
    throw new MissingSpecID('simulate')

  const plugin = runtime.findPlugin(subject)
  if (!plugin) {
    throw new NotSpecable(subject)
  }
  return {} as any

  // const actions = await loadActions({ io }, id)
  // const actionTracker = new ActionTracker(id, actions)
  // const context = createStubContext(actionTracker, plugin.type)

  // const spec: Spec<T> = {
  //   id,
  //   mode: 'simulate',
  //   actions,
  //   subject: plugin.getStub(context, subject),
  //   on(actionType: string, name: string, callback) {
  //     actionTracker.on(actionType, name, callback)
  //   },
  //   onAny(callback) {
  //     actionTracker.onAny(callback)
  //   },
  //   satisfy(expectation) {
  //     return Promise.resolve().then(() => {
  //       satisfy(spec.actions, expectation)
  //     })
  //   },
  //   done() {
  //     return this.satisfy([])
  //   }
  // }
  // return spec
}

// async function loadActions({ io }, specId: string) {
//   try {
//     const specRecord = await io.readSpec(specId)
//     return fixCircularRefs(specRecord.actions)
//   }
//   catch (err) {
//     throw new SpecNotFound(specId, err)
//   }
// }

// function fixCircularRefs(actions: SpecAction[]) {
//   const objRefs = []
//   return actions.map(action => {
//     return { ...action, payload: fixCirRefValue(action.payload, objRefs) }
//   })
// }

// function fixCirRefValue(value, objRefs: object[]) {
//   if (Array.isArray(value)) {
//     return value.map(p => fixCirRefValue(p, objRefs))
//   }
//   if (value === undefined || value === null) return value

//   const type = typeof value
//   if (type === 'object') {
//     objRefs.push(value)
//     Object.keys(value).forEach(k => value[k] = fixCirRefValue(value[k], objRefs))
//     return value
//   }
//   if (typeof value !== 'string') return value

//   const matches = /\[circular:(\d+)\]/.exec(value)
//   if (matches) {
//     const cirId = parseInt(matches[1], 10)
//     return objRefs[cirId]
//   }
//   return value
// }
