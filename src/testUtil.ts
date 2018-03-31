import { Spec, spec } from '.';

export function testTrio(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testTrio(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testTrio(description, specName, handler?) {
  testLive(description, specName, handler)
  testSave(description, specName, handler)
  testSimulate(description, specName, handler)
}

export function testLive(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLive(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLive(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  test(`${description}: live`, async () => {
    return handler(spec)
  })
}

export function testLiveOnly(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLiveOnly(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testLiveOnly(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  test.only(`${description}: live`, async () => {
    return handler(spec)
  })
}

export function testSave(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSave(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSave(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  test(`${description}: save`, async () => {
    return handler(s => spec.save(specName, s))
  })
}

export function testSimulate(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulate(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulate(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  test(`${description}: simulate`, async () => {
    return handler(s => spec.simulate(specName, s))
  })
}

export function testSimulateOnly(specName: string, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulateOnly(description: string, specName, handler: ((spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>))
export function testSimulateOnly(description, specName, handler?) {
  if (handler) {
    description = `${description} (with ${specName})`
  }
  else {
    handler = specName
    specName = description
  }
  test.only(`${description}: simulate`, async () => {
    return handler(s => spec.simulate(specName, s))
  })
}
