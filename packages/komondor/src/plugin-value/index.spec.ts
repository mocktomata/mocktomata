import { testSpec } from '../support-util';

const valueTypes = [false, 1, 'a', undefined, null, Symbol(), NaN]
import a from 'assertron'
testSpec.trio('value types subject is itself', (title, spec) => {
  test(title, async () => {
    a.satisfies(await Promise.all(valueTypes.map(async v => (await spec(v)).subject)), valueTypes)
  })
})
