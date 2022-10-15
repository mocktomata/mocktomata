import type { AsyncContext } from 'async-fp'
import { transformConfig } from '../config/index.js'
import type { Config } from '../config/types.js'
import type { Log } from '../log/types.js'
import { loadPlugins } from '../spec-plugin/index.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { Spec } from '../spec/types.js'
import { TimeTracker } from '../timeTracker/createTimeTracker.js'

export namespace Scenario {
  export type IO = Spec.IO & SpecPlugin.IO & Config.IO

  export type Context = { io: IO } & Config.Context & Log.Context
}

export function createScenario(context: AsyncContext<Scenario.Context>) {
  const ctx = context
    .extend(loadPlugins)
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })
  return Object.assign(
    createScenarioFn(ctx),
    {
      live: createFixedScenarioFn(ctx, 'live'),
      save: createFixedScenarioFn(ctx, 'save'),
      simulate: createFixedScenarioFn(ctx, 'simulate'),
      // async teardown() {
      //   const { timeTrackers } = await ctx.get()
      //   timeTrackers.forEach(t => t.terminate())
      // },
    }
  )
}

function createScenarioFn(context: AsyncContext<Scenario.Context>) {
  return function scenario(id: string) {
    return {
      ensure() { },
      setup() { },
      spec() { },
      teardown() { },
      done() { }
    }
  }
}

function createFixedScenarioFn(context: AsyncContext<Scenario.Context>, _mode: Spec.Mode) {
  return createScenarioFn(context)
}
