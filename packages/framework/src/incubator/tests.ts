import { CreateSpec, spec, Spec } from '../spec';

export type KomondorTestHandler = (
  title: string,
  spec: TestSpec
) => void | Promise<any>

/**
 * Run spec in both save and simulate mode
 */
export function testDuo(title: string, handler: KomondorTestHandler) {
  testSave(title, handler)
  testSimulate(title, handler)
}

export function testSave(title: string, handler: KomondorTestHandler) {
  const saveTitle = `${title}: save`
  handler(saveTitle, createTestSpec(spec.save, title))
}

export function testSimulate(title: string, handler: KomondorTestHandler) {
  const simTitle = `${title}: simulate`
  handler(simTitle, createTestSpec(spec.simulate, title))
}


/**
 * Runs save and simulate in different sequence.
 */
export function testSequence(title: string, handler: (title: string, specs: { save: TestSpec, simulate: TestSpec }) => void) {
  handler(title, {
    save: createTestSpec(spec.save, title),
    simulate: createTestSpec(spec.simulate, title),
  })
}

export type TestSpec = {
  mock<S>(subject: S): Promise<S>,
  done(): Promise<void>
}

function createTestSpec(specFn: CreateSpec, title: string): TestSpec {
  let s: Spec
  return {
    mock: subject => getSpec().then(s => s.mock(subject)),
    done: () => getSpec().then(s => s.done())
  }

  async function getSpec() {
    if (s) return s

    // eslint-disable-next-line require-atomic-updates
    return s = await specFn(title)
  }
}
