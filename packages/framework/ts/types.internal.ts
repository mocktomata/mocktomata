import type { Config } from './config/types.js'
import type { Log } from './log/types.js'
import type { loadPlugins } from './spec-plugin/index.js'
import { TimeTrackersContext } from './timeTracker/createTimeTracker.js'
import type { Mocktomata } from './types.js'

export type LoadedContext = Mocktomata.IOContext & Log.Context
  & loadPlugins.ExtendedContext
  & Config.ResultContext
  & TimeTrackersContext
