import * as genericFunction from './genericFunction'
import * as promise from './promise'
import * as childProcess from './childProcess'

import { SpecStore } from './specStore'

const plugins: any[] = []
function getSpy({ resolve, store }, subject) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const spy = p.getSpy && p.getSpy({ resolve, store }, subject)
    if (spy)
      return spy
  }
}
function getStub({ resolve, store }, subject, id) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const stub = p.getStub && p.getStub({ resolve, store }, subject, id)
    if (stub)
      return stub
  }
}

function getReturnSpy({ resolve, store }, subject) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const spy = p.getReturnSpy && p.getReturnSpy({ resolve, store }, subject)
    if (spy)
      return spy
  }
}
function getReturnStub({ store, resolve }: { store: SpecStore, resolve: any }, type: string) {
  for (let i = 0; i < plugins.length; i++) {
    const p = plugins[i]
    const stub = p.getReturnStub && p.getReturnStub({ store, resolve }, type)
    console.log('got stub', stub)
    if (stub)
      return stub
  }
}

export const plugin = {
  register(plugin) {
    plugins.unshift(plugin)
    if (plugin.activate)
      plugin.activate({
        getSpy,
        getStub,
        getReturnSpy,
        getReturnStub
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
