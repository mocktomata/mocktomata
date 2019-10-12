import { spec, Spec } from '../spec';

export type KomondorTestHandler = (
  description: string,
  spec: <T>(subject: T) => Promise<Spec<T>>
) => void | Promise<any>

export function testTrio(description: string, handler: KomondorTestHandler) {
  testLive(description, handler)
  testSave(description, handler)
  testSimulate(description, handler)
}

export function testLive(description: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'live') {
    handler(
      `${description}: live`,
      subject => spec.live(description, subject)
    )
  }
}

export function testSave(description: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'save') {
    handler(
      `${description}: save`,
      subject => spec.save(description, subject)
    )
  }
}

export function testSimulate(description: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'simulate') {
    handler(
      `${description}: simulate`,
      subject => spec.simulate(description, subject)
    )
  }
}
