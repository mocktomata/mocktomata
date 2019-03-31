import a from 'assertron';
import { getServerInfo } from './getServerInfo';

test('will try to search for server', async () => {
  const info = await getServerInfo()
  a.satisfies(info, {
    name: 'komondor',
    url: /http:\/\/localhost:\d+/
  })
})
