import { KomondorPlugin } from '../plugin';

export const arrayPlugin: KomondorPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    subject.forEach((s, i) => subject[i] = recorder.getSpy(s))
    return subject
  },
  createStub: ({ player }, subject) => {
    const stub: any[] = []
    const instancePlayer = player.declare(stub)
    subject.forEach(s => stub.push(instancePlayer.getStub(s)))
    return stub
  }
}
