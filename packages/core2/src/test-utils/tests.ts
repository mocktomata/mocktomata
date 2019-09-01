import { spec, Spec, CreateSpec } from '../spec';

export type KomondorTestHandler = (
  title: string,
  spec: TestSpec
) => void | Promise<any>

export function testTrio(title: string, handler: KomondorTestHandler) {
  testLive(title, handler)
  testSave(title, handler)
  testSimulate(title, handler)
}

export function testDuo(title: string, handler: KomondorTestHandler) {
  testSave(title, handler)
  testSimulate(title, handler)
}

export function testLive(title: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'live') {
    const liveTitle = `${title}: live`
    handler(liveTitle, createTestSpec(spec.live, liveTitle))
  }
}

export function testSave(title: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'save') {
    const saveTitle = `${title}: save`
    handler(saveTitle, createTestSpec(spec.save, saveTitle))
  }
}

export function testSimulate(title: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'simulate') {
    const simTitle = `${title}: simulate`
    handler(simTitle, createTestSpec(spec.simulate, simTitle))
  }
}
export type TestSpec = {
  mock<S>(subject: S): Promise<S>,
  done(): Promise<void>
}
function createTestSpec(specFn: CreateSpec, title: string): TestSpec {
  return {
    mock: subject => getSpec().then(s => s.mock(subject)),
    done: () => getSpec().then(s => s.done())
  }

  let s: Spec
  async function getSpec() {
    if (s) return s

    // eslint-disable-next-line require-atomic-updates
    return s = await specFn(title)
  }
}
