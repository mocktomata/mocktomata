import { spyFunction } from './getSpyFunction'
import { stubFunction } from './getStubFunction';

export const genericFunction = {
  canHandleSubject(subject) {
    return typeof subject === 'function'
  },
  getSpy({ resolve, store }, subject) {
    return spyFunction({ resolve, store }, subject)
  },
  getStub({ resolve, store }, subject, id) {
    return stubFunction({ resolve, store }, subject, id)
  }
}
