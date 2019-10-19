import { ScenarioIO } from './scenario'
import { SpecIO, SpecPluginModuleIO } from './mockto'

export type KomondorIO = SpecIO & SpecPluginModuleIO & ScenarioIO
