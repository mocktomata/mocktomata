import { Spec, SpecMode } from './interfaces';
export declare function createSpec(defaultMode: SpecMode): <T>(id: string, subject: T, options?: {
    timeout: number;
}) => Promise<Spec<T>>;
//# sourceMappingURL=createSpec.d.ts.map