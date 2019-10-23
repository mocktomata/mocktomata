import a from 'assertron'
import { config } from '.'
import { mockto } from '../mockto'

test.skip('config() can only be called before using mockto', async () => {
  await mockto('start a new spec')
  a.throws(() => config({}))
})
