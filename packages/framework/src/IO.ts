import { ScenarioIO } from './scenario'
import { SpecIO, SpecPluginModuleIO } from './spec'

export type KomondorIO = SpecIO & SpecPluginModuleIO & ScenarioIO
