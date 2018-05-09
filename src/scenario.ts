import { MissingHandler, DuplicateHandler } from './errors'
import { Spec } from './interfaces'
import {
  spec,
  // @ts-ignore
  SpecFn
} from './spec';
import { store } from './store';
import { SpecMode } from 'komondor-plugin';
import { io } from './io';

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
  // TODO: delete old specs if in save mode.
  const recorder = new ScenarioRecorder(id)
  const setup = createStepCaller(id, mode, id => recorder.createSetupSpecId(id))
  const spec = createSpec(id, mode, id => recorder.createRunSpecId(id))
  const run = createStepCaller(id, mode, id => recorder.createRunSpecId(id))
  const teardown = createStepCaller(id, mode, id => recorder.createTeardownSpecId(id))
  function done() {
    if (mode === 'save')
      return io.writeScenario(id, recorder.record)
    else
      return Promise.resolve()
  }
  return { setup, run, spec, teardown, done, mode }
}

function createStepCaller(id: string, mode: SpecMode, generateSpecId: (id: string) => string) {
  return async function setup(clause: string, ...inputs: any[]) {
    const entry = store.steps.find(e => {
      if (e.regex) {
        return e.regex.test(clause)
      }
      return e.clause === clause
    })
    if (!entry) {
      throw new MissingHandler(clause)
    }

    const runSubStep = createStepCaller(`${id}/${clause}`, mode, subId => generateSpecId(subId))

    // TODO: different inputs should not affect SpecRecord.
    // This currently creates conflict if different input is used in the
    // same scenario with the same clause.
    // This shouldn't happen as inputs should be artifacts only,
    // but may need to make this explicit and confirm.
    const spec = createSetupSpec(mode, specId => `${generateSpecId(specId ? `${clause}/${specId}` : clause)}`)
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
}

function createSetupSpec(mode: SpecMode, generateSpecId: (id?: string) => string) {
  switch (mode) {
    case 'live':
      return function <T>(subject: T) {
        return spec(generateSpecId(), subject)
      }
    case 'save':
      return function <T>(subject: T) {
        return spec.save(generateSpecId(), subject)
      }
    case 'simulate':
      return function <T>(subject: T) {
        return spec.simulate(generateSpecId(), subject)
      }
  }
}

export interface ScenarioSpec {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
}

function createSpec(_id: string, mode: SpecMode, generateSpecId: (id: string) => string): ScenarioSpec {
  switch (mode) {
    case 'live':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        return spec(`${generateSpecId(id)}`, subject)
      }
    case 'save':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        return spec.save(`${generateSpecId(id)}`, subject)
      }
    case 'simulate':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        return spec.simulate(`${generateSpecId(id)}`, subject)
      }
  }
}

export function defineStep(clause: string, handler: (context: SetupContext, ...args: any[]) => any) {
  const entry = store.steps.find(entry => {
    return entry.clause.toString() === clause.toString()
  })
  if (entry)
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
