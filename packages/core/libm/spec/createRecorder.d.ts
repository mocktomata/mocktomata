import { SpecContext } from '../context';
import { SpecOptions } from './types';
export declare function createRecorder(context: SpecContext, id: string, options: SpecOptions): {
    getSpy<T>(subject: T): T;
    end(): Promise<void>;
    save(): Promise<void>;
};
//# sourceMappingURL=createRecorder.d.ts.map