import type { Config } from './config/types.js'
import type { Log } from './log/types.js'
import type { loadPlugins } from './spec_plugin/index.js'
import type { StackFrameContext } from './stack_frame.types.js'
import type { TimeTrackersContext } from './time_trackter/time_tracker.js'
import type { Mocktomata } from './types.js'

export type LoadedContext = Mocktomata.IOContext &
	Log.Context &
	loadPlugins.ExtendedContext &
	Config.ResultContext &
	StackFrameContext &
	TimeTrackersContext
