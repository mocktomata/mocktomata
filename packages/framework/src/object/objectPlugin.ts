import { reduceKey } from 'type-plus';
import { SpecPlugin } from '../spec';
// import { getPropertyNames } from '../utils';

export const objectPlugin: SpecPlugin<Record<string | number, any>, Record<string | number, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getSpy }, subject) => {
    return new Proxy(subject, {
      get(target, property: string) {
        if (Object.getOwnPropertyNames(target).indexOf(property) === -1) return undefined
        return getSpy(target[property as any], { site: [property as any] })
      },
    })
    // const propertyNames = getPropertyNames(subject)
    // const result = propertyNames.reduce((p, name) => {
    //   p[name] = getSpy(subject[name], { site: [name] })
    //   return p
    // }, {} as any)

    // return result
  },
  createStub: ({ resolve }, _subject, meta) => {
    return new Proxy(meta, {
      get(target, property) {
        return resolve(target[property as any], { site: [property as any] })
      }
    })
    // const stub = reduceKey(meta, (p, k) => {
    //   p[k] = resolve(meta[k], { site: [k] })
    //   return p
    // }, {} as any)
    // return stub
  },
  metarize({ metarize }, spy) {
    const meta = reduceKey(spy, (p, k) => {
      p[k] = metarize(spy[k])
      return p
    }, {} as any)
    return meta
  }
}
