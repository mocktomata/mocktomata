import { reduceKey } from 'type-plus';
import { SpecPlugin } from '../spec';
import { getPropertyNames } from '../utils';

export const objectPlugin: SpecPlugin<Record<string | number, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getSpy }, subject) => {
    const propertyNames = getPropertyNames(subject)
    return propertyNames.reduce((p, name) => {
      const value = subject[name]
      p[name] = getSpy(value, { sourceSite: [name] })
      // const valueType = typeof value
      // if (valueType === 'function' || (valueType === 'object' && valueType !== null)) {
      //   p[name] = getSpy(value)
      // }
      // else {
      //   p[name] = value
      // }
      return p
    }, {} as any)
  },
  createStub: ({ resolve }, meta) => {
    // console.log('createStub meta', meta)
    const stub = reduceKey(meta, (p, k) => {
      p[k] = resolve(meta[k])
      return p
    }, {} as any)
    // console.log('stub', stub   )
    return stub
  },
  metarize({ metarize }, spy) {
    const meta = reduceKey(spy, (p, k) => {
      p[k] = metarize(spy[k])
      return p
    }, {} as any)
    return meta
  }
}
