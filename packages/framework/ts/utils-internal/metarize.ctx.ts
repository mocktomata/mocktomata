import { deserialize, serialize } from '@ungap/structured-clone'

export function parse(str: string) {
  return deserialize(JSON.parse(str))
}

export function stringify(value: unknown) {
  return JSON.stringify(serialize(value, { json: true, lossy: true } as any))
}
