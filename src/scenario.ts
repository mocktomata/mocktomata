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
  inputs: any[]
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

function createScenario(id: string, mode: SpecMode) {
  const scenarioRecord = {
    setups: [] as string[],
    specs: [] as string[],
    teardowns: [] as string[]
  }
  const setup = createStepCaller(id, mode, id => scenarioRecord.setups.push(id))
  const spec = createSpec(id, mode, id => scenarioRecord.specs.push(id))
  const run = createStepCaller(id, mode, id => scenarioRecord.specs.push(id))
  const teardown = createStepCaller(id, mode, id => scenarioRecord.teardowns.push(id))
  function done() {
    if (mode === 'save')
      return io.writeScenario(id, scenarioRecord)
    else
      return Promise.resolve()
  }
  return { setup, run, spec, teardown, done, mode }
}

function createStepCaller(id: string, mode: SpecMode, creationListener: (id: string) => void) {
  return async function setup(clause: string, ...inputs: any[]) {
    creationListener(clause)
    const entry = store.steps.find(e => {
      if (e.regex) {
        return e.regex.test(clause)
      }
      return e.clause === clause
    })
    if (!entry) {
      throw new MissingHandler(clause)
    }

    // TODO: different inputs should not affect SpecRecord.
    // This currently creates conflict if different input is used in the
    // same scenario with the same clause.
    // This shouldn't happen as inputs should be artifacts only,
    // but may need to make this explicit and confirm.
    const spec = createSetupSpec(`${id}/${clause}`, mode)
    if (entry.regex) {
      // regex must pass as it is tested above
      const matches = entry.regex.exec(clause)!
      const values = entry.valueTypes ? matches.slice(1, matches.length).map((v, i) => {
        const valueType = entry.valueTypes![i]
        if (valueType === 'number')
          return parseInt(v, 10)
        if (valueType === 'boolean')
          return v === 'true'
        if (valueType === 'float')
          return parseFloat(v)
        return v
      }) : matches.slice(1, matches.length)
      return entry.handler({ inputs, spec }, ...values)
    }
    return entry.handler({ inputs, spec })
  }
}

function createSetupSpec(id: string, mode: SpecMode) {
  switch (mode) {
    case 'live':
      return function <T>(subject: T) {
        return spec(id, subject)
      }
    case 'save':
      return function <T>(subject: T) {
        return spec.save(id, subject)
      }
    case 'simulate':
      return function <T>(subject: T) {
        return spec.simulate(id, subject)
      }
  }
}

export interface ScenarioSpec {
  <T>(subject: T): Promise<Spec<T>>
  <T>(id: string, subject: T): Promise<Spec<T>>
}

function createSpec(id: string, mode: SpecMode, creationListener: (id: string) => void): ScenarioSpec {
  const scenarioId = id
  switch (mode) {
    case 'live':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        creationListener(id)
        return spec(`${scenarioId}/${id}`, subject)
      }
    case 'save':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        creationListener(id)
        return spec.save(`${scenarioId}/${id}`, subject)
      }
    case 'simulate':
      return function (id, subject?) {
        if (!subject) {
          subject = id
          id = 'default'
        }
        creationListener(id)
        return spec.simulate(`${scenarioId}/${id}`, subject)
      }
  }
}

export function defineStep(clause: string | RegExp, handler: (context: SetupContext, ...args: any[]) => any) {
  const entry = store.steps.find(entry => {
    return entry.clause.toString() === clause.toString()
  })
  if (entry)
    throw new DuplicateHandler(clause)
  if (clause instanceof RegExp) {
    store.steps.push({ clause: clause.toString(), handler, regex: clause })
  }
  else if (isTemplate(clause)) {
    const valueTypes: string[] = []
    const regex = new RegExp('^' + clause.replace(/{([\w:]*)}/g, (_, value) => {
      const m = /\w*:(\w*)/.exec(value)
      valueTypes.push(m ? m[1].trim() : 'string')
      return '([\\w\.:]*)'
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
