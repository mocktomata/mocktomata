import { Spec, SpecOptions } from './types';
export declare const spec: SpecFn;
export interface SpecFn {
    <T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>;
    live<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>;
    save<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>;
    simulate<T>(id: string, subject: T, options?: SpecOptions): Promise<Spec<T>>;
}
//# sourceMappingURL=spec.d.ts.map