import { pick } from 'type-plus';
import { findPlugin, getPlugin } from '../plugin';
import { createTimeTracker, log, TimeTracker } from '../util';
import { NotSpecable } from './errors';
import { SpecAction, SpecOptions, InstantiateAction, InvokeAction, GetAction, SetAction, ReturnAction, ThrowAction } from './types';
import { SpecReferenceLive } from './typesInternal';
import { Omit } from 'type-plus'
import { specAction } from './isMismatchAction.spec';

export class SpecRecorder<T = any> {
  private refs: SpecReferenceLive[] = []
  private actions: SpecAction[] = []
  private time: TimeTracker
  public subject: T
  constructor(public id: string, subject: T, options: SpecOptions) {
    this.time = createTimeTracker(options, () => {
      log.warn(`done() was not called in ${options.timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
    })
    this.subject = this.getSpy(subject)
  }
  getSpy<T>(subject: T): T {
    const plugin = findPlugin(subject)
    if (!plugin) throw new NotSpecable(subject)

    const recorder = new SpyRecorder(this, plugin.name, subject)
    return plugin.createSpy({ recorder }, subject)
  }
  addReference(plugin: string, subject: any, target: any, serialize = true) {
    const ref = this.findRef(target)
    if (!ref) {
      this.refs.push(serialize ? { plugin, subject, target, serialize } : { plugin, subject, target })
      return String(this.refs.length - 1)
    }

    return ref
  }
  findRef(target: any) {
    const id = this.refs.findIndex(ref => ref.target === target)
    return (id !== -1) ? String(id) : undefined
  }
  pushAction(action: Omit<InstantiateAction, 'tick'> | Omit<InvokeAction, 'tick'> | Omit<GetAction, 'tick'> | Omit<SetAction, 'tick'> | Omit<ReturnAction, 'tick'> | Omit<ThrowAction, 'tick'>) {
    return this.actions.push({ ...action, tick: this.time.elaspe() })
  }
  end() {
    this.time.stop()
  }
  getRecord() {
    return {
      refs: this.refs.map(ref => {
        const plugin = getPlugin(ref.plugin)!
        if (plugin.serialize) {
          return {
            ...pick(ref, 'plugin', 'serialize'),
            subject: plugin.serialize(ref.subject)
          }
        }
        else {
          return pick(ref, 'plugin', 'serialize', 'subject')
        }
      }),
      actions: this.actions
    }
  }
}

class SpyRecorder {
  constructor(private specRecorder: SpecRecorder, private plugin: string, private subject: any) { }

  declare(spy: any) {
    return new SpySubjectRecorder(this.specRecorder, this.plugin, this.subject, spy)
  }
  getSpy<T>(subject: T): T {
    return this.specRecorder.getSpy(subject)
  }
}

class SpySubjectRecorder {
  public ref: string
  constructor(private specRecorder: SpecRecorder, public plugin: string, subject: any, spy: any) {
    this.ref = this.specRecorder.addReference(this.plugin, subject, spy, false)
  }
  instantiate(args: any[]) {
    return new SpyInstanceRecorder(this.specRecorder, this.ref, args)
  }
  invoke(args?: any[]) {
    return new SpyInvocationRecorder(this.specRecorder, this.ref, args)
  }
  get(name: string | number) {
    return new SpyGetterRecorder(this.specRecorder, this.ref, name)
  }
  set(name: string | number, value: any) {
    return new SpySetterRecorder(this.specRecorder, this.ref, name, value)
  }
}

class SpyInstanceRecorder {
  private id: number
  constructor(private specRecorder: SpecRecorder, private ref: string, args: any[]) {
    const payload: any[] = []
    args.forEach((arg, i) => {
      const spy = args[i] = specRecorder.getSpy(arg)
      payload.push(this.specRecorder.findRef(spy) || spy)
    })
    this.id = this.specRecorder.pushAction({
      type: 'instantiate',
      ref: this.ref,
      payload
    })
  }
  get(name: string | number) {
    return new SpyGetterRecorder(this.specRecorder, this.id, name)
  }
  set(name: string | number, value: any) {
    return new SpySetterRecorder(this.specRecorder, this.id, name, value)
  }
}

class SpyGetterRecorder {
  private id: number
  constructor(private specRecorder: SpecRecorder, private ref: string | number, name: string | number) {
    this.id = this.specRecorder.pushAction({
      type: 'get',
      ref: this.ref,
      payload: name
    })
  }
  returns(value: any) {
    const spy = this.specRecorder.getSpy(value)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'return',
      ref: this.id,
      payload: ref
    })
    return spy
  }
  throws(err: any) {
    const spy = this.specRecorder.getSpy(err)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'throw',
      ref: this.id,
      payload: ref
    })
    return spy
  }
}

class SpySetterRecorder {
  private id: number
  constructor(private specRecorder: SpecRecorder, private ref: string | number, name: string | number, value: any) {
    this.id = this.specRecorder.pushAction({
      type: 'set',
      ref: this.ref,
      payload: [name, value]
    })
  }
  returns(value: any) {
    const spy = this.specRecorder.getSpy(value)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'return',
      ref: this.id,
      payload: ref
    })
    return spy
  }
  throws(err: any) {
    const spy = this.specRecorder.getSpy(err)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'throw',
      ref: this.id,
      payload: ref
    })
    return spy
  }
}

class SpyInvocationRecorder {
  private id: number
  constructor(private specRecorder: SpecRecorder, private ref: string, args?: any[]) {
    const payload: any[] = []
    if (args) {
      args.forEach((arg, i) => {
        const spy = args[i] = specRecorder.getSpy(arg)
        payload.push(this.specRecorder.findRef(spy) || spy)
      })
    }
    this.id = this.specRecorder.pushAction({
      type: 'invoke',
      ref: this.ref,
      payload
    })
  }
  returns(value: any) {
    const spy = this.specRecorder.getSpy(value)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'return',
      ref: this.id,
      payload: ref
    })
    return spy
  }
  throws(err: any) {
    const spy = this.specRecorder.getSpy(err)
    const ref = this.specRecorder.findRef(spy)
    this.specRecorder.pushAction({
      type: 'throw',
      ref: this.id,
      payload: ref
    })
    return spy
  }
}
