import { start } from './start';

test('start new service', async () => {
  return start({ ui: {} }, { url: 'ab' })
})
