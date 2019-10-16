import a from 'assertron';
import { ServerNotAvailable, ServerNotAvailableAtPortRange } from './errors';
import { getServerInfo } from './getServerInfo';

test('will try to search for server', async () => {
  const fetch = (() => {
    let count = 0
    return () => {
      if (count < 3) {
        count++
        return Promise.reject({ code: 'some error' })
      }
      return Promise.resolve({
        json() {
          return Promise.resolve({
            name: 'komondor',
            url: 'http://localhost:3712',
            plugins: ['@mocktomata/plugin-fixture-dummy']
          })
        }
      } as any)
    }
  })();

  const info = await getServerInfo({ fetch, location })
  a.satisfies(info, {
    name: 'komondor',
    url: 'http://localhost:3712',
    plugins: ['@mocktomata/plugin-fixture-dummy']
  })
})

test('throws when specific server is not available', async () => {
  const fetch = () => Promise.reject({ code: 'ECONNREFUSED' })

  await a.throws(getServerInfo({ fetch, location }, { url: 'http://localhost:4321' }), ServerNotAvailable)
})

test('throws when server is not up', async () => {
  const fetch = () => Promise.reject({})
  await a.throws(getServerInfo({ fetch, location }), ServerNotAvailableAtPortRange)
})

test('remote', async () => {
  let actual: RequestInfo
  const fetch = (url: RequestInfo) => {
    actual = url
    return Promise.resolve({
      json() {
        return Promise.resolve({
          name: 'komondor',
          url: 'http://komondor.com',
          plugins: ['@mocktomata/plugin-fixture-dummy']
        })
      }
    } as any)
  }
  const location = {
    protocol: 'https:',
    hostname: 'komondor.com'
  }
  await getServerInfo({ fetch, location })
  expect(actual!).toBe('https://komondor.com/komondor/info')
})
