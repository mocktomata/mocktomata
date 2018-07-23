import { artifactKey } from './constants';
import { RecursiveIntersect } from 'type-plus';
/**
 * create an artifact out of the original value.
 * Note that artifact object cannot be used in enumerating comparision,
 * such as `t.deepStrictEqual()`.
 * @param original original value. It should be simple object (think struct)
 */
export declare function artifact<T = any>(id: string, original?: T): RecursiveIntersect<T, {
    [artifactKey]: string;
}>;
export declare function overruleArtifact<T>(id: string, override: T): T;
//# sourceMappingURL=artifact.d.ts.map