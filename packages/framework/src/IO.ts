import { ScenarioIO } from './scenario/types'
import { SpecIO, SpecPluginModuleIO } from './mockto/types'

export type MocktomataIO = SpecIO & SpecPluginModuleIO & ScenarioIO
