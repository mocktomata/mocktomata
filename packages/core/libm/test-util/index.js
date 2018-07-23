import { spec } from '../spec';
export * from './createTestIO';
export * from './ensure';
export * from './missGetSpyPlugin';
export * from './missGetStubPlugin';
export * from './missSupportPlugin';
export * from './noActivatePluginModule';
export * from './plugins';
export function testTrio(description, handler) {
    testLive(description, handler);
    testSave(description, handler);
    testSimulate(description, handler);
}
export function testLive(description, handler) {
    handler(`${description}: live`, s => spec.live(description, s));
}
export function testSave(description, handler) {
    handler(`${description}: save`, s => spec.save(description, s));
}
export function testSimulate(description, handler) {
    handler(`${description}: simulate`, s => spec.simulate(description, s));
}
const komondorTest = {
    live: testLive,
    save: testSave,
    simulate: testSimulate,
    trio: testTrio
};
export default komondorTest;
//# sourceMappingURL=index.js.map