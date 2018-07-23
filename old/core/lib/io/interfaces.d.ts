import { PluginIO } from '@komondor-lab/plugin';
import { ScenarioIO } from '../scenario';
import { SpecIO } from '../spec';
export declare type DataAccessIO = {
    cwd?: string;
    url?: string;
};
export declare type IO = PluginIO & SpecIO & ScenarioIO;
//# sourceMappingURL=interfaces.d.ts.map