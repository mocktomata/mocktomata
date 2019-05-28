import { KomondorPlugin } from '../../plugin';

export const arrayPlugin: KomondorPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy: (context, subject) => {
    const spy: any[] = []
    const recorder = context.newSpyRecorder(spy)
    const instanceRecorder = recorder.construct(subject)

    instanceRecorder.spiedArgs.forEach((a: any) => spy.push(a))
    return spy
  },
  createStub: (context, subject) => {
    const stub: any[] = []
    const recorder = context.newStubRecorder(stub)
    const instanceRecorder = recorder.construct(subject)
    instanceRecorder.stubbedArgs.forEach((a: any) => stub.push(a))
    return stub
  },
  createReplayer(context, value) {
    const entry = JSON.parse(value) as any[]
    const fake: any[] = []
    const replayer = context.newReplayer(fake)
    const instanceReplayer = replayer.construct(entry)
    instanceReplayer.stubbedArgs.forEach((a: any) => fake.push(a))
    return fake
  },
  construct(target, args) {
    console.log(target)
    return target
  }
  // get: (spy, prop) => {
  //   return spy[prop as any]
  // }
}
