import { SpecContext } from '../context';
import { findPlugin, StubContext } from '../plugin';
import { PluginInstance } from '../plugin/typesInternal';
import { NotSpecable } from './errors';
import { SpecRecordInstance } from './SpecRecordInstance';
import { SpecRecordValidator, createSpecRecordValidator } from './createSpecRecordValidator';
import { SpecOptions, SpecRecord } from './types';

export async function createSpecSimulator<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  const actual = await context.io.readSpec(id)

  if (typeof subject !== 'function' && typeof subject !== 'object' && Array.isArray(subject)) throw new NotSpecable(subject)

  const recordValidator = createSpecRecordValidator(id, actual)

  const stub = getStub(recordValidator, subject)

  return {
    subject: stub,
    async end() {
      recordValidator.end()
      return
    }
  }
}

function getStub<T>(recordValidator: SpecRecordValidator, subject: T): T {
  const plugin = findPlugin(subject)
  if (!plugin) throw new NotSpecable(subject)

  const stubContext = createStubContext(recordValidator, plugin, subject)
  return plugin.createStub(stubContext, subject)
}

function createStubContext(recordValidator: SpecRecordValidator, plugin: PluginInstance, subject: any): StubContext {
  const player = new StubReplayer(recordValidator, plugin.name, subject) as any
  return {
    player
  }
}

class StubReplayer {
  constructor(private record: SpecRecordValidator, private plugin: string, private subject: any) { }

  declare(stub: any) {
    return new StubSubjectReplayer(this.record, this.plugin, this.subject, stub)
  }
}

class StubSubjectReplayer {
  public ref: string
  /**
   * id of action.
   * It increments for every "action set"
   */
  private id = 0
  constructor(public record: SpecRecordValidator, public plugin: string, subject: any, stub: any) {
    this.ref = this.record.addReference(this.plugin, subject, stub)
  }
  getStub<T>(subject: T): T {
    return getStub(this.record, subject)
  }
  invoke(args: any[]) {
    return new StubInvocationReplayer(this, args)
  }
  nextId() {
    return ++this.id
  }
  findRef(target: any) {
    return this.record.findRef(target)
  }
}

class StubInvocationReplayer {
  constructor(private subjectReplayer: StubSubjectReplayer, args: any[]) {
    const payload: any[] = []
    args.forEach((arg, i) => {
      const stub = args[i] = subjectReplayer.getStub(arg)
      payload.push(this.subjectReplayer.findRef(stub) || stub)
    })
    this.subjectReplayer.record.actions.push({
      type: 'invoke',
      ref: this.ref,
      payload
    })
  }
  returns(value: any) {
    const spy = getSpy(this.record, value)
    const ref = this.record.findRef(spy)
    this.record.actions.push({
      type: 'invoke-return',
      ref: this.subjectReplayer.ref,
      id: this.id,
      payload: ref
    })
    return spy
  }
  throws(err: any) {
    const spy = getSpy(this.record, err)
    const ref = this.record.findRef(spy)
    this.record.actions.push({
      type: 'invoke-throw',
      ref: this.ref,
      id: this.id,
      payload: ref
    })
    return spy
  }
}
