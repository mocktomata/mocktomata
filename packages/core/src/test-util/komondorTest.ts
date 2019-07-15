import { addAppender } from '@unional/logging';
import { ColorAppender } from 'aurelia-logging-color';
import { spec, Spec } from '../spec';

export type KomondorTestHandler = (
  title: string,
  spec: <T>(subject: T) => Promise<Spec<T>>,
  harness: {}
) => void | Promise<any>

function createHarness(specId: string) {

  return {

  }
}

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
      async subject => {
        const s = await spec.live(description, subject)
        return s
      },
      createHarness(description)
    )
  }
}

export function testSave(description: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'save') {
    // tslint:disable-next-line: no-floating-promises
    handler(
      `${description}: save`,
      async subject => {
        const s = spec.save(description, subject)

        return s
      },
      {
        showLog(logLevel: number) {
          const color = new ColorAppender()

          addAppender(color)
        }
      }
    )
  }
}

export function testSimulate(description: string, handler: KomondorTestHandler) {
  const ktm = process.env.KOMONDOR_TEST_MODE
  if (!ktm || ktm === 'simulate') handler(
    `${description}: simulate`,
    s => spec.simulate(description, s),
    createHarness(description)
  )
}

export const komondorTest = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio,
}
