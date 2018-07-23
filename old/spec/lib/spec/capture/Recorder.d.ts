import { SpyContext, Spy } from '../../types';
import { SpecAction, Meta } from '../types';
export declare class Recorder implements SpyContext {
    pluginName: string;
    instanceIdMap: Record<string, number>;
    actions: SpecAction[];
    constructor(pluginName: string);
    newSpy(args?: any[], meta?: Meta): Spy;
    private getNewInstanceId;
}
//# sourceMappingURL=Recorder.d.ts.map