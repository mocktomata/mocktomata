import type { loadPlugins } from './spec-plugin/index.js'
import type { Log } from './log/types.js'
import type { Mocktomata } from './types.js'
import { transformConfig } from './config/transformConfig.js'
import { TimeTrackersContext } from './timeTracker/createTimeTracker.js'

export type LoadedContext = Mocktomata.IOContext & Log.Context
  & loadPlugins.ExtendedContext
  & transformConfig.ExtendedContext
  & TimeTrackersContext
