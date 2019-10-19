import { reduceKey } from 'type-plus';
import { SpecPlugin } from '../mockto';
import { getPropertyNames } from '../utils';

export const objectPlugin: SpecPlugin<Record<string | number, any>, Record<string | number, any>> = {
  name: 'object',
  support: subject => subject !== null && typeof subject === 'object',
  createSpy: ({ getSpy }, subject) => {
    const propertyNames = getPropertyNames(subject)
    const result = propertyNames.reduce((p, name) => {
      p[name] = getSpy(subject[name], { site: [name] })
      return p
    }, {} as any)

    return result
  },
  createStub: ({ resolve }, _subject, meta) => {
    const stub = reduceKey(meta, (p, k) => {
      p[k] = resolve(meta[k], { site: [k] })
      return p
    }, {} as any)
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
