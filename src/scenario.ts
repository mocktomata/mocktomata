import { SpecMode } from 'komondor-plugin';

import { DuplicateHandler, MissingHandler, SpecNotFound } from './errors';
import { Spec, SpecRecord } from './interfaces';
import { io } from './io';
import { createSpec } from './specInternal';
import { store } from './store';
import { log } from './log';

export interface StepContext {
  spec<T>(subject: T): Promise<Spec<T>>,
  /**
   * @deprecated extra inputs are appended to the handler.
   */
  inputs: any[],
  runSubStep(clause: string, ...inputs: any[]): Promise<any>
}

export const scenario = Object.assign(
  function scenario(id: string) {
    const mode = getEffectiveMode(id, 'live')
    return createScenario(id, mode)
  },
  {
    save(id: string) {
      const mode = getEffectiveMode(id, 'save')
      return createScenario(id, mode)
    },
    simulate(id: string) {
      const mode = getEffectiveMode(id, 'simulate')
      return createScenario(id, mode)
    }
  })

function getEffectiveMode(clause: string, mode: SpecMode) {
  const override = store.scenarioOverrides.find(s => {
    if (typeof s.filter === 'string')
      return s.filter === clause
    else
      return s.filter.test(clause)
  })
  return override ? override.mode :
    store.defaultMode || mode
}

class RecordIO {
  record = {
    ensures: [] as { id: string, spec: SpecRecord }[],
    setups: [] as { id: string, spec: SpecRecord }[],
    runs: [] as { id: string, spec: SpecRecord }[],
    teardowns: [] as { id: string, spec: SpecRecord }[]
  }
  loadingScenario: Promise<any>
  constructor(public id: string) { }
  getAccessor(type: string) {
    const me = this
    return {
      id: this.id,
      pop(id: string) {
        return me.popSpec(type, id)
      },
      push(id: string, spec: SpecRecord) {
        me.record[type].push({ id, spec })
      }
    }
  }
  save() {
    return io.writeScenario(this.id, this.record)
  }
  private async popSpec(type: string, specId: string) {
    if (!this.loadingScenario) {
      this.loadingScenario = io.readScenario(this.id)
        .then(s => this.record = s)
    }
    await this.loadingScenario
    const i = this.record[type].findIndex(spec => spec.id === specId)
    if (i === -1) throw new SpecNotFound(specId);
    return this.record[type].splice(i, 1)[0].spec
  }
}

function createScenario(id: string, mode: SpecMode) {
  const io = new RecordIO(id)
  const ensure = createInertStepCaller(io.getAccessor('ensures'), 'ensure', mode, false)
  const setup = createInertStepCaller(io.getAccessor('setups'), 'setup', mode)
  const spec = createScenarioSpec(io.getAccessor('runs'), 'spec', mode)
  const run = createStepCaller(io.getAccessor('runs'), 'run', mode)
  const teardown = createInertStepCaller(io.getAccessor('teardowns'), 'teardown', mode)
  function done() {
    if (mode === 'save')
      return io.save()
    else
      return Promise.resolve()
  }
  return { ensure, setup, run, spec, teardown, done, mode }
}

function createInertStepCaller(record, defaultId: string, mode: SpecMode, shouldLog: boolean = true) {
  return async function inertStep(clause: string, ...inputs: any[]) {
    const entry = store.steps.find(e => {
      if (e.regex) {
        return e.regex.test(clause)
      }
      return e.clause === clause
    })
    if (!entry) {
      throw new MissingHandler(clause)
    }

    try {
      return await invokeHandler({ defaultId, mode, entry, record }, clause, inputs)
    }
    catch (err) {
      if (shouldLog)
        log.warn(`scenario${mode === 'live' ? '' : `.${mode}`}(${record.id})
- ${defaultId}(${clause}) throws, is it safe to ignore?

${err}`)
    }
  }
}
function createStepCaller(record, defaultId: string, mode: SpecMode) {
  return async function step(clause: string, ...inputs: any[]) {
    const entry = store.steps.find(e => {
      if (e.regex) {
        return e.regex.test(clause)
      }
      return e.clause === clause
    })
    if (!entry) {
      throw new MissingHandler(clause)
    }

    return invokeHandler({ defaultId, mode, entry, record }, clause, inputs)
  }
}

function invokeHandler({ defaultId, mode, entry, record }, clause, inputs) {
  const runSubStep = createStepCaller(record, defaultId, mode)

  const spec = createScenarioSpec(record, clause, mode)
  if (entry.regex) {
    // regex must pass as it is tested above
    const matches = entry.regex.exec(clause)!
    const values = matches.slice(1, matches.length).map((v, i) => {
      const valueType = entry.valueTypes![i]
      if (valueType === 'number')
        return parseInt(v, 10)
      if (valueType === 'boolean')
        return v === 'true'
      if (valueType === 'float')
        return parseFloat(v)
      return v
    })
    return entry.handler({ inputs, spec, runSubStep }, ...[...values, ...inputs])
  }
  return entry.handler({ inputs, spec, runSubStep }, ...inputs)
}

export interface ScenarioSpec {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
}

function createScenarioSpec(record, defaultId: string, mode: SpecMode): ScenarioSpec {
  return function (id, subject?) {
    if (!subject) {
      subject = id
      id = defaultId
    }
    const io = {
      readSpec(id: string) {
        return record.pop(id)
      },
      writeSpec(id: string, specRecord: SpecRecord) {
        record.push(id, specRecord)
      }
    }
    return createSpec({ io }, id, subject, mode)
  }
}

export const defineStep = Object.assign(
  function defineStep<C extends string>(clause: C, handler: (context: StepContext, ...args: any[]) => any) {
    const entry = store.steps.find(entry => {
      return entry.clause.toString() === clause.toString()
    })
    if (entry && entry.handler !== handler)
      throw new DuplicateHandler(clause)
    else if (isTemplate(clause)) {
      const valueTypes: string[] = []
      const regex = new RegExp(`^${clause.replace(/{([\w:]*)}/g, (_, value) => {
        const m = /[\w]*:(\w*)/.exec(value)
        valueTypes.push(m ? m[1].trim() : 'string')
        return '([\\w\\.\\-]*)'
      })}$`)
      store.steps.push({ clause, handler, regex, valueTypes })
    }
    else {
      store.steps.push({ clause, handler })
    }
  },
  {
    isDefined(clause: string) {
      return store.steps.some(entry => entry.clause === clause)
    }
  })

function isTemplate(clause: string) {
  return clause.search(/{([\w-=:]*)}/) >= 0
}
