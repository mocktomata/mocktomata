import { KomondorPlugin } from '../../plugin';

export const arrayPlugin: KomondorPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  getSpy: (context, subject) => {
    const spy: any[] = []
    const recorder = context.newSpyRecorder(spy)
    const instanceRecorder = recorder.construct(subject)

    instanceRecorder.spiedArgs.forEach((a: any) => spy.push(a))
    return spy
  },
  getStub: (context, subject) => {
    const stub: any[] = []
    const recorder = context.newStubRecorder(stub)
    const instanceRecorder = recorder.construct(subject)
    return instanceRecorder.spiedArgs
  },
  construct(target, args) {
    console.log(target)
    return target
  }
  // get: (spy, prop) => {
  //   return spy[prop as any]
  // }
}
