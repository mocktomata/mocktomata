import { SpecPlugin } from '../spec';

export const arrayPlugin: SpecPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    subject.forEach((s, i) => subject[i] = recorder.getSpy(s))
    return subject
  },
  createStub: ({ player }, subject) => {
    const stub: any[] = []
    player.declare(stub)
    subject.forEach(s => stub.push(player.getStub(s)))
    return stub
  }
}
