import { ExpressionFactory, ParameterType, ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import { createLogContext } from '../log/createLogContext.js'
import { loadPlugins } from '../spec-plugin/index.js'
import { createSpecFns, getEffectiveSpecModeContext } from '../spec/index.js'
import type { Spec } from '../spec/types.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { initTimeTrackers } from '../timeTracker/createTimeTracker.js'
import { LoadedContext } from '../types.internal.js'
import type { Mocktomata } from '../types.js'
import { DuplicateStep, MissingStep } from './errors.js'
import { createStore, Step, Store } from './store.js'

export namespace Zucchini {
  export type StepCaller = (clause: string, ...inputs: any[]) => Promise<any>

  export type StepContext = {
    clause: string,
    mode: Spec.Mode,
    runSubStep: StepCaller,
    spec<T>(subject: T): Promise<T>,
  } & Pick<Spec, 'maskValue' | 'ignoreMismatch'>

  export type StepHandler = (context: StepContext, ...args: any[]) => any
}

export function createZucchini(context: AsyncContext<Mocktomata.Context>) {
  const { store } = createStore()
  const scenario = createScenario(context, store)
  const { defineStep, defineParameterType } = createStepFns(store)
  return { scenario, defineStep, defineParameterType }
}

function createScenario(context: AsyncContext<Mocktomata.Context>, store: Store) {
  const ctx = context
    .extend(loadConfig)
    .extend(loadPlugins)
    .extend(initTimeTrackers)

  return Object.assign(
    createScenarioFn(ctx, store),
    {
      live: createScenarioFn(ctx, store, 'live'),
      save: createScenarioFn(ctx, store, 'save'),
      simulate: createScenarioFn(ctx, store, 'simulate'),
      async cleanup() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}

function createScenarioFn(context: AsyncContext<LoadedContext>, store: Store, mode?: Spec.Mode) {
  return function scenario(specName: string, options: Spec.Options = { timeout: 3000 }) {
    const reporter = createMemoryLogReporter()

    const ctx = context
      .extend({ options, reporter, specName, specRelativePath: getCallerRelativePath(scenario) })
      .extend(getEffectiveSpecModeContext(mode))
      .extend(createLogContext)

    const { spec, modeProperty, done, ignoreMismatch, maskValue } = createSpecFns(ctx)
    const modeFn = function mode() { return modeProperty.get() }
    const subCtx = ctx.extend({ spec, modeFn, maskValue, ignoreMismatch })
    return {
      /**
       * Ensure the test environment is clean before the test starts.
       *
       * Any error occurs in these steps are ignored completely.
       */
      ensure: createInertStepCaller(subCtx, store, 'ensure', false),
      /**
       * Setup the test environment.
       * This is the `Given` step.
       *
       * Any error occurs in these steps will not fail the test.
       * An warning message will be printed in case it worths noting.
       */
      setup: createInertStepCaller(subCtx, store, 'setup'),
      /**
       * Directly spec a subject and test away.
       * It is the same `spec()` as in `komondor` and `mockto`.
       */
      spec: spec as <T>(subject: T) => Promise<T>,
      /**
       * Run a step as the test.
       *
       * Any error occurs in these steps will fail the test.
       * They are the test itself.
       */
      run: createStepCaller(subCtx, store, 'run'),
      /**
       * Teardown the test environment.
       *
       * Any error occurs in these steps will not fail the test.
       * An warning message will be printed in case it worths noting.
       */
      teardown: createInertStepCaller(subCtx, store, 'teardown'),
      /**
       * Indicate the test is done.
       *
       * Either return this or `await` for it to complete.
       */
      done,
      ignoreMismatch,
      maskValue,
      mode: modeFn,
      reporter
    }
  }
}

function createInertStepCaller(context: AsyncContext<Spec.Context>, store: Store, stepName: string, shouldLogError = true) {
  return async function inertStep(clause: string, ...inputs: any[]) {
    const entry = lookupStep(store, clause)
    const { log, mode, specName } = await context.get()

    try {
      log.debug(`${stepName}(${clause})`)
      return await invokeHandler(context, store, stepName, entry, clause, inputs)
    }
    catch (err) {
      if (shouldLogError) {
        log.warn(
          `scenario${mode === 'auto' ? '' : `.${mode}`}(${specName})
- ${stepName}(${clause}) throws, is it safe to ignore?

${err}`)
      }
    }
  }
}

function createStepCaller(context: AsyncContext<InvokeHandlerContext>, store: Store, stepName: string) {
  return async function step(clause: string, ...inputs: any[]) {
    const entry = lookupStep(store, clause)
    const { log } = await context.get()
    log.debug(`${stepName}(${clause})`)
    return invokeHandler(context, store, stepName, entry, clause, inputs)
  }
}

type InvokeHandlerContext = Spec.Context & {
  spec: <T>(subject: T) => Promise<T>
} & Pick<Spec, 'maskValue' | 'ignoreMismatch'>

async function invokeHandler(context: AsyncContext<InvokeHandlerContext>, store: Store, stepName: string, entry: Step, clause: string, inputs: any[]) {
  const runSubStep = createStepCaller(context, store, stepName)
  const { spec, maskValue, mode, ignoreMismatch } = await context.get()
  const args = buildHandlerArgs(entry, clause, inputs)
  return entry.handler({ spec, clause, maskValue, mode, runSubStep, ignoreMismatch }, ...args)
}

function buildHandlerArgs(entry: Step, clause: string, inputs: any[]) {
  const args = entry.expression.match(clause)
  if (args && args.length > 0) {
    return [...args.map(a => {
      return a.getValue(a)
    }), ...inputs]
  }
  else return inputs
}

function lookupStep(store: Store, clause: string) {
  const entry = store.steps.find(s => s.expression.match(clause))
  if (!entry) throw new MissingStep(clause)
  return entry
}


function createStepFns(store: Store) {
  function assertNoDuplicate(clause: string | RegExp, handler: Zucchini.StepHandler) {
    const str = typeof clause === 'string' ? clause : clause.source
    const step = store.steps.find(s => s.expression.source === str)
    if (step && step.handler !== handler) throw new DuplicateStep(clause)
  }
  const r = new ParameterTypeRegistry()
  const f = new ExpressionFactory(r)

  function defineStep(clause: string | RegExp, handler: Zucchini.StepHandler) {
    assertNoDuplicate(clause, handler)
    const expression = f.createExpression(clause)
    store.steps.push({ expression, handler })
  }

  /**
   * @note This code comes straight from `cucumber-js`.
   *
   * @todo Need to check if we need/use the `useForSnippets` props.
   * @see https://github.com/cucumber/cucumber-js/blob/73d896377bf4045fc5799395d3215453a7e1b700/docs/support_files/api_reference.md#defineparametertypename-preferforregexpmatch-regexp-transformer-useforsnippets
   * @see https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/build_parameter_type.ts#L4
   */
  function defineParameterType<T>({ name, regexp, transformer, useForSnippets, preferForRegexpMatch }: IParameterTypeDefinition<T>) {
    if (typeof useForSnippets !== 'boolean') useForSnippets = true
    if (typeof preferForRegexpMatch !== 'boolean') preferForRegexpMatch = false
    r.defineParameterType(new ParameterType(
      name,
      regexp,
      null,
      transformer!,
      useForSnippets,
      preferForRegexpMatch
    ))
  }

  defineParameterType({
    name: 'boolean',
    regexp: /true|false/,
    transformer: s => s === 'true'
  })

  defineParameterType({
    name: 'number',
    regexp: /[+-]?\d+/,
    transformer: s => Number(s)
  })

  return { defineStep, defineParameterType }
}

/**
 * @param name the name of the type
 * @param regexps that matche the type
 * @param type the prototype (constructor) of the type. May be null.
 * @param transform function transforming string to another type. May be null.
 * @param useForSnippets true if this should be used for snippets. Defaults to true.
 * @param preferForRegexpMatch true if this is a preferential type. Defaults to false.
 */
export type IParameterTypeDefinition<T> = {
  name: string,
  regexp: readonly RegExp[] | readonly string[] | RegExp | string,
  transformer?: (...match: string[]) => T,
  useForSnippets?: boolean,
  preferForRegexpMatch?: boolean
}
