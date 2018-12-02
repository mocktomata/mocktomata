import { io } from '../io';
import { Plugin } from '../plugin';
import { store } from '../runtime';
import { IDCannotBeEmpty, NotSpecable } from './errors';

export interface Spec<T> {
  subject: T
}

export type SpecMode = 'live' | 'save' | 'simulate'

export async function spec<T>(id: string, subject: T): Promise<Spec<T>> {
  assertSpecID(id)
  const mode = getSpecMode(id, 'live')
  return createSpec({ io }, id, subject, mode)
}

async function saveSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  assertSpecID(id)
  const mode = getSpecMode(id, 'save')
  return createSpec({ io }, id, subject, mode)
}

async function simulateSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  assertSpecID(id)
  const mode = getSpecMode(id, 'simulate')
  return createSpec({ io }, id, subject, mode)
}


async function liveSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  assertSpecID(id)
  const mode = getSpecMode(id, 'live')
  return createSpec({ io }, id, subject, mode)
}

spec.save = saveSpec
spec.simulate = simulateSpec
spec.live = liveSpec

function getSpecMode(_id: string, mode: SpecMode): SpecMode {
  return mode
}

function assertSpecID(id: string) {
  if (id === '') throw new IDCannotBeEmpty()
}

type CreateSpecContext = { io: typeof io }
function createSpec({ io }: CreateSpecContext, specId: string, subject: any, mode: SpecMode) {
  const plugins = store.get<Plugin[]>('plugins')

  const plugin = plugins && plugins.find(p => p.support(subject))
  if (!plugin) {
    throw new NotSpecable(subject)
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

async function createSavingSpec<T>(context: any, id: string, subject: T): Promise<Spec<T>> {
  return Promise.resolve({} as any)
}
async function createStubbingSpec<T>(context: any, id: string, subject: T): Promise<Spec<T>> {
  return Promise.resolve({} as any)
}

async function createSpyingSpec<T>(id: string, subject: T): Promise<Spec<T>> {
  return Promise.resolve({} as any)

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
