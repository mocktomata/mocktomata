import { isPromise } from 'type-plus';
import { SpecPlugin } from '../spec-plugin'
import { createMap, demetarize, hasProperty, isBaseObject, metarize } from '../utils-internal';

const map = createMap()

type SpyTrackData = { pending: boolean, publicMethods: string[] }

export const instancePlugin: SpecPlugin<Record<string | number, any>, { base: string, classConstructor: string, functionCalls: string[] }> = {
  name: 'instance',
  support: subject => {
    if (subject === null) return false
    if (typeof subject !== 'object') return false
    return !isBaseObject(Object.getPrototypeOf(subject))
  },
  createSpy: ({ getProperty, invoke, setProperty, setMeta, getSpyId, setSpyOptions }, subject) => {
    const classConstructor = Object.getPrototypeOf(subject).constructor
    setSpyOptions(classConstructor, { plugin: '@mocktomata/es2015/class' })
    const meta = setMeta({
      base: metarize(subject),
      classConstructor: getSpyId(classConstructor),
      functionCalls: [],
    })
    const spy = new Proxy(subject, {
      get(target: any, key: string) {
        if (!hasProperty(subject, key)) return undefined
        const prop = subject[key]
        if (typeof prop === 'function') {
          return (...args: any[]) => {
            meta.functionCalls.push(key)
            const tracker = map.get(spy) as SpyTrackData
            if (!tracker.pending || tracker.publicMethods.indexOf(key) >= 0) {
              tracker.pending = true
              if (tracker.publicMethods.indexOf(key) === -1) {
                tracker.publicMethods.push(key)
              }
              try {
                let result = invoke({ site: key, thisArg: spy, args }, ({ args }) => prop.apply(target, args))
                if (isPromise(result)) {
                  result = result.then(v => {
                    tracker.pending = false
                    return v
                  })
                }
                else {
                  tracker.pending = false
                }
                return result
              }
              catch (e) {
                tracker.pending = false
                throw e
              }
            }
            else {
              return prop.apply(target, args)
            }
          }
        }
        else {
          return getProperty({ key }, () => prop)
        }
      },
      set(_, property: string, value: any) {
        return setProperty({ key: property, value }, value => subject[property] = value)
      }
    })
    map.set(spy, { pending: false, publicMethods: [] })

    return spy
  },
  createStub: ({ getProperty, setProperty, resolve, invoke }, _, meta) => {
    const base = demetarize(meta.base)
    const classConstructor = resolve(meta.classConstructor)
    Object.setPrototypeOf(base, Object.getPrototypeOf(classConstructor).prototype)
    const stub = new Proxy(base, {
      get(_: any, property: string) {
        if (meta.functionCalls.length > 0 && meta.functionCalls[0] === property) {
          return (...args: any[]) => {
            meta.functionCalls.shift()
            return invoke({ site: property, thisArg: stub, args })
          }
        }
        return getProperty({ key: property })
      },
      set(_, key: string, value: any) {
        return setProperty({ key, value })
      }
    })
    return stub
  }
}
