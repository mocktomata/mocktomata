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
import { createStore, Store } from './store.js'

export namespace Zucchini {
  export type IO = Spec.IO & SpecPlugin.IO & Config.IO

  export type Context = { io: IO } & Config.Context & Log.Context

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
    const { spec, modeProperty, done, enableLog, ignoreMismatch, maskValue } = createSpecFns(
      context
        .extend({ reporter, specName, specRelativePath: getCallerRelativePath(scenario) })
        .extend(getEffectiveSpecModeContext(mode))
        .extend(createLogContext), specName, options)
    return {
      ensure: createInertStepCaller(context, store, 'ensure', false),
      setup: createInertStepCaller(context, store, 'setup'),
      spec,
      run: createStepCaller(context, store, 'run'),
      teardown: createInertStepCaller(context, store, 'teardown'),
      done,
      enableLog,
      ignoreMismatch,
      maskValue,
      mode() { return modeProperty.get() }
    }
  }
}

function createInertStepCaller(context: AsyncContext<Zucchini.Context>, store: Store, defaultId: string, shouldLog = true) {
  return async function inertStep(clause: string, ...inputs: any[]) {
    lookupStep(store, clause)
    const { log } = await context.get()

    try {
      log.info(`${defaultId}(${clause})`)
      // return await invokeHandler({}, clause, inputs)
    }
    catch (err) {
      if (shouldLog) {
        // log.warn(`scenario${mode === 'live' ? '' : `.${mode}`}(${record.id})
        // - ${defaultId}(${clause}) throws, is it safe to ignore?

        // ${err}`)
      }
    }
  }
}

function createStepCaller(context: AsyncContext<Zucchini.Context>, store: Store, defaultId: string, shouldLog = true) {
  return async function step(clause: string, ...inputs: any[]) {
    lookupStep(store, clause)
    // return invokeHandler()
  }
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

    if (typeof clause === 'string')
      store.steps.push({ clause, handler })
    else
      store.steps.push({ clause: clause.toString(), handler, regex: clause })

  }
}
