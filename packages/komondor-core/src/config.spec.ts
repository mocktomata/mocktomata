import { config } from '.'

it('config is exposed', () => {
  config({
    url: 'http://localhost:3002'
  })
})
