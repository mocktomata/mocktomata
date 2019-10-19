import { CreateSpec, mockto, MocktoHandler, MocktoOptions, Spec } from '../mockto';

/**
 * Run spec in both save and simulate mode
 */
export function testDuo(title: string, options: MocktoOptions, handler: MocktoHandler): void
export function testDuo(title: string, handler: MocktoHandler): void
export function testDuo(title: string, arg1: any, arg2?: any) {
  if (arg2) {
    const options: MocktoOptions = arg1
    const handler: MocktoHandler = arg2
    testSave(title, options, handler)
    testSimulate(title, options, handler)
  }
  else {
    const handler: MocktoHandler = arg1
    testSave(title, handler)
    testSimulate(title, handler)
  }
}

export function testSave(title: string, options: MocktoOptions, handler: MocktoHandler): void
export function testSave(title: string, handler: MocktoHandler): void
export function testSave(title: string, arg1: any, arg2?: any) {
  const saveTitle = `${title}: save`
  if (arg2) {
    const options: MocktoOptions = arg1
    const handler: MocktoHandler = arg2
    handler(saveTitle, createTestSpec(mockto.save, title, options))
  }
  else {
    const handler: MocktoHandler = arg1
    handler(saveTitle, createTestSpec(mockto.save, title))
  }
}

export function testSimulate(title: string, options: MocktoOptions, handler: MocktoHandler): void
export function testSimulate(title: string, handler: MocktoHandler): void
export function testSimulate(title: string, arg1: any, arg2?: any) {
  const simTitle = `${title}: simulate`
  if (arg2) {
    const options: MocktoOptions = arg1
    const handler: MocktoHandler = arg2
    handler(simTitle, createTestSpec(mockto.simulate, title, options))
  }
  else {
    const handler: MocktoHandler = arg1
    handler(simTitle, createTestSpec(mockto.simulate, title))
  }
}

export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }) => void
/**
 * Runs save and simulate in different sequence.
 */
export function testSequence(title: string, options: MocktoOptions, handler: SequenceHandler): void
export function testSequence(title: string, handler: SequenceHandler): void
export function testSequence(title: string, arg1: any, arg2?: any) {
  const options: MocktoOptions | undefined = arg2 ? arg1 : undefined
  const handler: SequenceHandler = arg2 ? arg2 : arg1
  handler(title, {
    save: createTestSpec(mockto.save, title, options),
    simulate: createTestSpec(mockto.simulate, title, options)
  })
}

function createTestSpec(specFn: CreateSpec, title: string, options?: MocktoOptions): Spec {
  let s: Spec
  return Object.assign(
    (subject: any) => getSpec().then(s => s(subject)), {
    done: () => getSpec().then(s => s.done())
  })

  async function getSpec() {
    if (s) return s

    // eslint-disable-next-line require-atomic-updates
    return s = await specFn(title, options)
  }
}
