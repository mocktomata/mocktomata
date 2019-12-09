import { required } from 'type-plus';
import { SpecPlugin } from '../spec/types';

function noop() { }

function passthrough(_: any, h: any) { return h() }

export function createSpyContextStub(partialContext?: Partial<SpecPlugin.SpyContext>): SpecPlugin.SpyContext {
  return required({
    getProperty: passthrough,
    setProperty: (o: any, h: any) => h(o.value),
    instantiate: passthrough,
    invoke: passthrough,
    setMeta: noop,
    setSpyOptions: noop,
    getSpyId: (v: any) => v,
  }, partialContext)
}
export function createStubContextStub(partialContext?: Partial<SpecPlugin.StubContext>): SpecPlugin.StubContext {
  return required({
    getProperty: passthrough,
    instantiate: passthrough,
    invoke: passthrough,
  }, partialContext)
}
