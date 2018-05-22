import { SpecMode } from 'komondor-plugin';

import { DuplicateHandler, MissingHandler } from './errors';
import { Spec } from './interfaces';
import { io } from './io';
import { createSpec } from './specInternal';
import { store } from './store';
import { log } from './log';

export interface SetupContext {
  spec<T>(subject: T): Promise<Spec<T>>,
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

class ScenarioRecorder {
  record = {
    setups: [] as string[],
    specs: [] as string[],
    teardowns: [] as string[]
  }
  counter = 0
  constructor(public scenarioId: string) { }
  createSetupSpecId(specId: string) {
    const id = `${++this.counter}-${specId}`
    this.record.setups.push(id)
    return `${this.scenarioId}/${id}`
  }
  createRunSpecId(specId: string) {
    const id = `${++this.counter}-${specId}`
    this.record.specs.push(id)
    return `${this.scenarioId}/${id}`
  }
  createTeardownSpecId(specId: string) {
    const id = `${++this.counter}-${specId}`
    this.record.teardowns.push(id)
    return `${this.scenarioId}/${id}`
  }
}

function createScenario(id: string, mode: SpecMode) {
  // TODO: delete old scenario and its specs if in save mode.
  const recorder = new ScenarioRecorder(id)
  const setup = createInertStepCaller('setup', mode, id => recorder.createSetupSpecId(id))
  const spec = createScenarioSpec('spec', mode, id => recorder.createRunSpecId(id))
  const run = createStepCaller('run', mode, id => recorder.createRunSpecId(id))
  const teardown = createInertStepCaller('teardown', mode, id => recorder.createTeardownSpecId(id))
  function done() {
    if (mode === 'save')
      return io.writeScenario(id, recorder.record)
    else
      return Promise.resolve()
  }
  return { setup, run, spec, teardown, done, mode }
}

function createInertStepCaller(defaultId: string, mode: SpecMode, generateSpecId: (id: string) => string) {
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
      return await invokeHandler({ defaultId, mode, generateSpecId, entry }, clause, inputs)
    }
    catch (err) {
      log.warn(`${defaultId}('${clause}') throws '${err}', is it safe to ignore?`)
    }
  }
}
function createStepCaller(defaultId: string, mode: SpecMode, generateSpecId: (id: string) => string) {
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

    return invokeHandler({ defaultId, mode, generateSpecId, entry }, clause, inputs)
  }
}

function invokeHandler({ defaultId, mode, generateSpecId, entry }, clause, inputs) {
  const runSubStep = createStepCaller(defaultId, mode, generateSpecId)

  const spec = createScenarioSpec(clause, mode, generateSpecId)
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
    return entry.handler({ inputs, spec, runSubStep }, ...values)
  }
  return entry.handler({ inputs, spec, runSubStep })
}

export interface ScenarioSpec {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
}

function createScenarioSpec(defaultId: string, mode: SpecMode, generateSpecId: (id: string) => string): ScenarioSpec {
  return function (id, subject?) {
    if (!subject) {
      subject = id
      id = defaultId
    }
    return createSpec(generateSpecId(id), subject, mode)
  }
}

export function defineStep<C extends string>(clause: C, handler: (context: SetupContext, ...args: any[]) => any) {
  const entry = store.steps.find(entry => {
    return entry.clause.toString() === clause.toString()
  })
  if (entry && entry.handler !== handler)
    throw new DuplicateHandler(clause)
  else if (isTemplate(clause)) {
    const valueTypes: string[] = []
    const regex = new RegExp('^' + clause.replace(/{([\w:]*)}/g, (_, value) => {
      const m = /[\w]*:(\w*)/.exec(value)
      valueTypes.push(m ? m[1].trim() : 'string')
      return '([\\w\\.\\-]*)'
    }))
    store.steps.push({ clause, handler, regex, valueTypes })
  }
  else {
    store.steps.push({ clause, handler })
  }
}

function isTemplate(clause: string) {
  return clause.search(/{([\w-=:]*)}/) >= 0
}
