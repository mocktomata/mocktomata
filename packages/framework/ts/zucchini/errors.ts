import { ModuleError } from 'iso-error'
import { MocktomataError } from '../errors.js'

export class DuplicateStep extends MocktomataError {
  constructor(public clause: string | RegExp, options?: ModuleError.Options) {
    super(`Step ${clauseToString(clause)} already defined`, options)
  }
}

export class MissingStep extends MocktomataError {
  constructor(public clause: string | RegExp, options?: ModuleError.Options) {
    super(`Step ${clauseToString(clause)} is not defined`, options)
  }
}

function clauseToString(clause: string | RegExp) {
  if (clause instanceof RegExp) return clause
  return `'${clause}'`
}
