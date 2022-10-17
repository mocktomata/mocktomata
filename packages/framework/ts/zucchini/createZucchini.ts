import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter } from 'standard-log'
import { transformConfig } from '../config/index.js'
import type { Config } from '../config/types.js'
import { createLogContext } from '../log/createLogContext.js'
import type { Log } from '../log/types.js'
import { loadPlugins } from '../spec-plugin/index.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import { createSpecFns, getEffectiveSpecModeContext } from '../spec/index.js'
import type { Spec } from '../spec/types.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { TimeTracker } from '../timeTracker/createTimeTracker.js'
import type { Mocktomata } from '../types.js'
import { DuplicateStep, MissingStep } from './errors.js'
import { createStore, Step, Store } from './store.js'

export namespace Zucchini {
  export type IO = Spec.IO & SpecPlugin.IO & Config.IO

  export type Context = { io: IO } & Config.Context & Log.Context & Spec.Context

  export type StepCaller = (clause: string | RegExp, ...inputs: any[]) => Promise<any>

  export type StepContext = {
    spec<T>(subject: T): Promise<T>,
    runSubStep: StepCaller
  }
  export type StepHandler = (context: StepContext, ...args: any[]) => any
}

export function createZucchini(context: AsyncContext<Mocktomata.Context>) {
  const ctx = context
  const { store } = createStore()
  const scenario = createScenario(ctx, store)
  const defineStep = createDefineStep(ctx, store)
  return { scenario, defineStep }
}

function createScenario(context: AsyncContext<Zucchini.Context>, store: Store) {
  const ctx = context
    .extend(loadPlugins)
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })
  return Object.assign(
    createScenarioFn(ctx, store),
    {
      live: createScenarioFn(ctx, store, 'live'),
      save: createScenarioFn(ctx, store, 'save'),
      simulate: createScenarioFn(ctx, store, 'simulate'),
      async teardown() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}

function createScenarioFn(context: AsyncContext<Zucchini.Context>, store: Store, mode?: Spec.Mode) {
  return function scenario(specName: string, options: Spec.Options = { timeout: 3000 }) {
    const reporter = createMemoryLogReporter()
    const ctx = context
      .extend({ options, reporter, specName, specRelativePath: getCallerRelativePath(scenario) })
      .extend(getEffectiveSpecModeContext(mode))
      .extend(createLogContext)
    const { spec, modeProperty, done, enableLog, ignoreMismatch, maskValue } = createSpecFns(ctx)
    return {
      ensure: createInertStepCaller(ctx, store, 'ensure', false),
      setup: createInertStepCaller(ctx, store, 'setup'),
      spec,
      run: createStepCaller(ctx, store, 'run'),
      teardown: createInertStepCaller(ctx, store, 'teardown'),
      done,
      enableLog,
      ignoreMismatch,
      maskValue,
      mode() { return modeProperty.get() }
    }
  }
}

function createInertStepCaller(context: AsyncContext<Zucchini.Context>, store: Store, stepName: string, shouldLogError = true) {
  return async function inertStep(clause: string, ...inputs: any[]) {
    const entry = lookupStep(store, clause)
    const { log, mode, specName } = await context.get()

    try {
      log.debug(`${stepName}(${clause})`)
      return invokeHandler(context, store, stepName, entry, clause, inputs)
      // return await invokeHandler({}, clause, inputs)
    }
    catch (err) {
      if (shouldLogError) {
        log.warn(`scenario${mode === 'live' ? '' : `.${mode}`}(${specName})
        - ${stepName}(${clause}) throws, is it safe to ignore?

        ${err}`)
      }
    }
  }
}

function createStepCaller(context: AsyncContext<Zucchini.Context>, store: Store, stepName: string) {
  return async function step(clause: string, ...inputs: any[]) {
    const entry = lookupStep(store, clause)
    const { log } = await context.get()
    log.debug(`${stepName}(${clause})`)
    return invokeHandler(context, store, stepName, entry, clause, inputs)
  }
}

function invokeHandler(context: AsyncContext<Zucchini.Context>, store: Store, stepName: string, entry: Step, clause: string, inputs: any[]) {
  const runSubStep = createStepCaller(context, store, stepName)
  const { spec } = createSpecFns(context)
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

function lookupStep(store: Store, clause: string) {
  const entry = store.steps.find(s => s.regex ? s.regex.test(clause) : s.clause === clause)
  if (!entry) throw new MissingStep(clause)
  return entry
}


function createDefineStep(context: AsyncContext<Zucchini.Context>, store: Store) {
  function assertNoDuplicate(clause: string | RegExp, handler: Zucchini.StepHandler) {
    const step = store.steps.find(s => s.clause.toString() === clause.toString())
    if (step && step.handler !== handler) throw new DuplicateStep(clause)
  }
  return function defineStep(clause: string | RegExp, handler: Zucchini.StepHandler) {
    assertNoDuplicate(clause, handler)

    if (typeof clause === 'string') {
      if (isTemplate(clause)) {
        const valueTypes: string[] = []
        const regex = new RegExp(`^${clause.replace(/{([\w-]*(:(number|boolean|float|string|\/([^\}]*)\/))?)?}/g, (_, value) => {
          const m = /[\w]*:(.*)/.exec(value)
          const valueType = m ? m[1].trim() : 'string'
          const isRegex = valueType.startsWith('/')
          if (isRegex) {
            valueTypes.push('regex')
            return `(${valueType.slice(1, -1)})`
          }
          else {
            valueTypes.push(valueType)
            return '([^ ]*)'
          }
        })}$`)
        store.steps.push({ clause, handler, regex, valueTypes })
      }
      else {
        store.steps.push({ clause, handler })
      }
    }
    else
      store.steps.push({ clause: clause.toString(), handler, regex: clause })

  }
}

function isTemplate(clause: string) {
  return clause.search(/{([\w-]*(:(number|boolean|float|string|\/(.*)\/))?)?}/) >= 0
}
