import { context, start } from '@komondor-lab/file-server';
import a from 'assertron';
import { PromiseValue } from 'type-plus';
import { ServerNotAvailable } from './errors';
import { getServerInfo } from './getServerInfo';
import { createFakeRepository } from './test-util';


let server: PromiseValue<ReturnType<typeof start>>
beforeAll(async () => {
  context.get().repository = createFakeRepository()
  server = await start()
})

afterAll(() => {
  return server.stop()
})

test('will try to search for server', async () => {
  const info = await getServerInfo()
  a.satisfies(info, {
    name: 'komondor',
    url: /http:\/\/localhost:\d+/,
    plugins: ['@komondor-lab/plugin-fixture-dummy']
  })
})

test('thorws when specific server is not available', async () => {
  await a.throws(getServerInfo({ url: 'http://localhost:4321' }), ServerNotAvailable)
})

