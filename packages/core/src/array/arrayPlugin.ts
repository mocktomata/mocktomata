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
    player.declare().setTarget(subject)
    subject.forEach((s, i) => subject[i] = player.getSpy(s))
    return subject
  },
  createRepresentation: ({ process }, subject) => subject.map(s => process(s)),
  recreateSubject: ({ process }, input: any[]) => input.map(s => process(s))
}
