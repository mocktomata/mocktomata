import { ScenarioIO } from './scenario'
import { SpecIO, SpecPluginModuleIO } from './mockto'

export type MocktomataIO = SpecIO & SpecPluginModuleIO & ScenarioIO
