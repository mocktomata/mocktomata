import r from 'ramda'

import { artifactKey } from './constants';

export function unartifact(value) {
  switch (value[artifactKey]) {
    case 'string':
      return String(value)
    case 'boolean':
      // tslint:disable-next-line:triple-equals
      return value == true
    case 'number':
      return Number(value)
    case 'array':
      return value.map(v => unartifact(v))
    case 'object':
      return r.map(unartifact, value)
    default:
      // istanbul ignore next
      return value
  }
}
