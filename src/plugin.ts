import * as childProcess from './childProcess'
import * as genericFunction from './genericFunction'
import * as promise from './promise'
import * as ws from './ws'

import { SpecContext, SpecPlayer } from './interfaces'
import { log } from './log'

const plugins: any[] = []
function getSpy(context: SpecContext, subject: any) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const spy = p.getSpy && p.getSpy(context, subject)
    if (spy)
      return spy
  }
}
function getStub(context: SpecContext, subject: any, id: string) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const stub = p.getStub && p.getStub(context, subject, id)
    if (stub)
      return stub
  }
}

function getReturnSpy(context: SpecContext, subject: any) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const spy = p.getReturnSpy && p.getReturnSpy(context, subject)
    if (spy)
      return spy
  }
}
function getReturnStub(context: SpecContext, type: string) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const stub = p.getReturnStub && p.getReturnStub(context, type)
    if (stub)
      return stub
  }
}

export interface PluginContext {
  /**
   * Call this function to indicates the execution is completed.
   * i.e. for Spy, all relevant actions are added to the store,
   * for Stub, all relevant actions has be replayed.
   */
  resolve(): void,
  /**
   * The action store for recording and replaying the actions.
   */
  store: SpecPlayer
}

export const plugin = {
  register(plugin) {
    plugins.unshift(plugin)
    if (plugin.activate)
      plugin.activate({
        getSpy,
        getStub,
        getReturnSpy,
        getReturnStub,
        log
      })
  },
  getSpy,
  getStub,
  getReturnSpy,
  getReturnStub
}

plugin.register(promise)
plugin.register(childProcess)
plugin.register(genericFunction)
plugin.register(ws)
