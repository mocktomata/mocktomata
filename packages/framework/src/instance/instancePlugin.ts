import { isPromise } from 'type-plus';
import { SpecPlugin } from '../spec';
import { createMap, demetarize, hasProperty, isBaseObject, metarize } from '../utils';

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
    // console.log('create instanc spy, sub/proto', subject, subjectPrototype, subjectPrototype.constructor)
    const meta = setMeta({
      base: metarize(subject),
      classConstructor: getSpyId(classConstructor),
      functionCalls: [],
    })
    // console.log('create instance')
    const spy = new Proxy(subject, {
      get(target: any, key: string) {
        if (!hasProperty(subject, key)) return undefined
        const prop = subject[key]
        if (typeof prop === 'function') {
          return (...args: any[]) => {
            meta.functionCalls.push(key)
            // return prop.apply(target, args)
            // return invoke({ thisArg: spy, args }, ({ args }) => prop.apply(target, args))
            const tracker = map.get(spy) as SpyTrackData
            if (!tracker.pending || tracker.publicMethods.indexOf(key) >= 0) {
              tracker.pending = true
              if (tracker.publicMethods.indexOf(key) === -1) {
                tracker.publicMethods.push(key)
              }
              try {
                // console.log('invoke', key)
                let result = invoke({ site: key, thisArg: spy, args }, ({ args }) => prop.apply(target, args))
                // console.log(result)
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
    // console.log('set tracker', spy)
    map.set(spy, { pending: false, publicMethods: [] })

    return spy

    // const keys = getPropertyNames(subject)
    // const spy: any = keys.reduce((p, key) => {
    //   if (typeof subject[key] === 'function') {
    //     const method = subject[key]
    //     p[key] = function (...args: any[]) {
    //       const tracker = map.get(this) as SpyTrackData
    //       if (!tracker.pending || tracker.publicMethods.indexOf(p) >= 0) {
    //         tracker.pending = true
    //         if (tracker.publicMethods.indexOf(p) === -1) {
    //           tracker.publicMethods.push(p)
    //         }
    //         try {
    //           let result = invoke({ site: key, thisArg: this, args }, ({ args }) => method.apply(this, args))
    //           if (isPromise(result)) {
    //             result = result.then(v => {
    //               tracker.pending = false
    //               return v
    //             })
    //           }
    //           else {
    //             tracker.pending = false
    //           }
    //           return result
    //         }
    //         catch (e) {
    //           tracker.pending = false
    //           throw e
    //         }
    //       }
    //       else {
    //         return method.apply(this, args)
    //       }
    //     }
    //   }
    //   else {
    //     Object.defineProperty(p, key, {
    //       get() {
    //         const tracker = map.get(p) as SpyTrackData
    //         if (tracker.pending) return subject[key]
    //         return getProperty({ key }, () => subject[key])
    //       },
    //       set(value: any) {
    //         const tracker = map.get(p) as SpyTrackData
    //         if (tracker.pending) return subject[key] = value
    //         return setProperty({ key, value }, value => subject[key] = value)
    //       }
    //     })
    //   }
    //   return p
    // }, {} as any)
    // spy.__proto__ = subject
    // map.set(spy, { pending: false, publicMethods: [] })
    // return spy
  },
  createStub: ({ getProperty, setProperty, resolve, invoke }, _, meta) => {
    console.log('create stub instance', _, meta)
    const base = demetarize(meta.base)
    console.log('base =', base)
    const classConstructor = resolve(meta.classConstructor)
    // Object.setPrototypeOf(base, ChildOfDummy.prototype)
    console.log(base, classConstructor, classConstructor.prototype)
    console.log(Object.getPrototypeOf(classConstructor))
    console.log(Object.getPrototypeOf(classConstructor).prototype)

    Object.setPrototypeOf(base, Object.getPrototypeOf(classConstructor).prototype)

    // console.log('base.con', base.__proto__.constructor)
    // console.log('base.proto', Object.getPrototypeOf(base))
    // console.log('base.proto', Object.getPrototypeOf(base).constructor)
    const stub = new Proxy(base, {
      // getPrototypeOf(_: any) {
      //   console.log('stub state proto', classConstructor, classConstructor.prototype)
      //   return classConstructor.prototype
      // },
      get(_: any, property: string) {
        console.log('get', property, meta)
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
