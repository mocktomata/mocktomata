import { SpecPlugin } from '../spec';

export const nullPlugin: SpecPlugin<null> = {
  name: 'null',
  support: subject => subject === null,
  createSpy: () => null,
  createStub: () => null
}
