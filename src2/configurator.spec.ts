import a from 'assertron'
import komondor from '.'
import { store, resetStore } from './store';

it('config() sets store.options', () => {
  komondor.config({ baseUrl: 'http://localhost:7897' })
  a.satisfy(store.get().options, {
    baseUrl: 'http://localhost:7897'
  })
})

afterEach(() => {
  resetStore()
})
