import a from 'assertron';
import { resetStore, store } from 'komondor-core';
import komondor from '.';

it('config() sets store.options', () => {
  komondor.config({ baseUrl: 'http://localhost:7897' })
  a.satisfy(store.get().options, {
    baseUrl: 'http://localhost:7897'
  })
})

afterEach(() => {
  resetStore()
})
