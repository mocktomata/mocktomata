// istanbul ignore file
import { Spec, spec } from '.'
import { SpecAction } from 'komondor-plugin';

export function testTrio(specName: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testTrio(description: string, specName, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testTrio(description, specName, handler?) {
  testLive(description, specName, handler)
  testSave(description, specName, handler)
  testSimulate(description, specName, handler)
}

export function testLive(specName: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLive(description: string, specName, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLive(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  handler(`${description}: live`, spec)
}

export function testSave(specName: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSave(description: string, specName, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSave(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  handler(`${description}: save`, s => spec.save(specName, s))
}

export function testSimulate(specName: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulate(description: string, specName, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulate(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  handler(`${description}: simulate`, s => spec.simulate(specName, s))
}

export function createSpecAction(partial: Partial<SpecAction>) {
  return partial as SpecAction
}
