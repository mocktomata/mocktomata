import { Spec } from '../spec';
export * from './createTestIO';
export * from './ensure';
export * from './missGetSpyPlugin';
export * from './missGetStubPlugin';
export * from './missSupportPlugin';
export * from './noActivatePluginModule';
export * from './plugins';
export declare function testTrio(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)): void;
export declare function testLive(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)): void;
export declare function testSave(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)): void;
export declare function testSimulate(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)): void;
declare const komondorTest: {
    live: typeof testLive;
    save: typeof testSave;
    simulate: typeof testSimulate;
    trio: typeof testTrio;
};
export default komondorTest;
//# sourceMappingURL=index.d.ts.map