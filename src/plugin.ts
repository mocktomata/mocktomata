import * as childProcess from './childProcess'
import * as genericClass from './class'
import * as genericFunction from './function'
import * as promise from './promise'
import * as stream from './stream'
import * as ws from './ws'

import { SpecContext, SpecPlayer } from './interfaces'
import { log } from './log'
import { SpecAction } from './index';

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

function getReturnSpy(context: SpecContext, subject: any, scope: string) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const spy = p.getReturnSpy && p.getReturnSpy(context, subject, scope)
    if (spy)
      return spy
  }
}
function getReturnStub(context: SpecContext, action: SpecAction) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const stub = p.getReturnStub && p.getReturnStub(context, action)
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

// order is important, top is generic, bottom is specific.
plugin.register(promise)
plugin.register(stream)
plugin.register(childProcess)
plugin.register(genericFunction)
plugin.register(genericClass)
plugin.register(ws)
