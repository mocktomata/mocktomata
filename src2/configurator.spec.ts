import a from 'assertron'
import komondor from '.'
import { store } from './store';

it('config() sets store.options', () => {
  komondor.config({ baseUrl: 'http://localhost:7897' })
  a.satisfy(store.options, {
    baseUrl: 'http://localhost:7897'
  })
})
