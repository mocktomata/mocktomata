import { SpecContext } from '../context';
import { SpecOptions } from './types';
export declare function createPlayer<T>(context: SpecContext, id: string, options: SpecOptions): {
    getStub<T_1>(subject: T_1): T_1;
    end(): Promise<void>;
};
//# sourceMappingURL=createPlayer.d.ts.map