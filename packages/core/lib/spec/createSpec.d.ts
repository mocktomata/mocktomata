import { SpecContext } from '../context';
import { Spec, SpecMode, SpecOptions } from './types';
export declare function createSpec(defaultMode: SpecMode): <T>(id: string, subject: T, options?: {
    timeout: number;
}) => Promise<Spec<T>>;
export declare function createAutoSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>>;
export declare function createLiveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>>;
export declare function createSaveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>>;
export declare function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>>;
//# sourceMappingURL=createSpec.d.ts.map