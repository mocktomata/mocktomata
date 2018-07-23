import { RecursiveIntersect } from 'type-plus';
import { artifactKey } from './constants';
export declare function artifactify<T>(original: T): RecursiveIntersect<T, {
    [artifactKey]: string;
}>;
export declare function unartifactify(value: any): any;
//# sourceMappingURL=artifactify.d.ts.map