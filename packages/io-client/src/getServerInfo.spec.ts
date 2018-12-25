import { createServer } from '@komondor-lab/io-server';
import a from 'assertron';
import { getServerInfo } from './getServerInfo';

let server: ReturnType<typeof createServer>
beforeAll(async () => {
  server = createServer({ port: 3701 })
  await server.start()
})
afterAll(async () => {
  await server.stop()
})


test('return options.url if specified', async () => {
  const url = 'http://localhost:3701'
  a.satisfies(await getServerInfo({ url }), {
    name: 'komondor',
    url
  })
})

test('will try to search for server', async () => {
  const info = await getServerInfo()
  a.satisfies(info, {
    name: 'komondor',
    url: 'http://localhost:3701'
  })
})
