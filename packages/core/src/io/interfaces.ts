import { PluginIO } from '@komondor-lab/plugin';
import { ScenarioIO } from '../scenario';
import { SpecIO } from '../spec';

export type DataAccessIO = {
  // dummy, not necessary will be used
  cwd?: string
  // dummy, not necessary will be used
  url?: string
}

export type IO = PluginIO & SpecIO & ScenarioIO

