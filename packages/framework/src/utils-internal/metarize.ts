import { reduceKey } from 'type-plus'

export function metarize(value: object | Function) {
  return JSON.stringify([getMetaType(value), getMeta(value)])
}

export function demetarize(meta: string) {
  const metaData = JSON.parse(meta)
  const base = getMetaBase(metaData[0])
  return Object.assign(base, metaData[1])
}

function getMetaType(value: object | Function) {
  if (typeof value === 'object') {
    return { type: 'object' }
  }
  else if (typeof value === 'function') {
    return {
      type: 'function',
      name: value.name,
      length: value.length
    }
  }
}

function getMeta(value: any) {
  return reduceKey(value, (p, key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!
    if (descriptor.enumerable) {
      if (descriptor.value === null || typeof descriptor.value !== 'object' && typeof descriptor.value !== 'function')
        p[key] = descriptor.value
    }
    return p
  }, {} as any)
}
function getMetaBase(metaType: any) {
  if (metaType.type === 'object') return {}

  const fnArgs = []
  for (let i = 0; i < metaType.length; i++) fnArgs.push('arg' + i)
  fnArgs.push('') // function body
  const fn = new Function(...fnArgs)
  Object.defineProperty(fn, 'name', { value: metaType.name })
  return fn
}
