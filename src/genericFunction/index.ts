import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction'

let komondor

export function activate(k) {
  komondor = k
}

export function getSpy({ resolve, store }, subject) {
  return spyFunction({ komondor, resolve, store }, subject)
}

export function getStub({ resolve, store }, subject, id) {
  return stubFunction({ komondor, resolve, store }, subject, id)
}
