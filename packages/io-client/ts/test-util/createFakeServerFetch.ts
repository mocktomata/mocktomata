import * as f from 'cross-fetch'

export function createFakeServerFetch() {
  const specs: Record<string, any> = {
    'exist': { 'actions': [] }
  }

  const scenarios: Record<string, any> = {
    'exist': { 'scenario': 'exist' }
  }

  return Object.assign(
    async (url: RequestInfo, init?: RequestInit) => {
      const uri = extractUri(url as string)
      if (uri === 'mocktomata/info') {
        return new f.Response(JSON.stringify({
          url: 'http://localhost:3999',
          version: '1.0',
        }))
      }
      else if (uri === 'mocktomata/config') {
        return new f.Response(JSON.stringify({
          plugins: ['@mocktomata/plugin-fixture-dummy']
        }))
      }
      // istanbul ignore next
      else if (uri.startsWith('mocktomata/specs/')) {
        const id = /mocktomata\/specs\/(.*)/.exec(uri)![1]
        const { specName } = JSON.parse(atob(id))
        if (init && init.method === 'POST') {
          specs[specName] = JSON.parse(init.body as string)
          return new f.Response(undefined)
        }
        else {
          if (specs[specName])
            return new f.Response(JSON.stringify(specs[specName]))
          else
            return new f.Response(undefined, { status: 404 })
        }
      }
      // istanbul ignore next
      console.error(url)
      // istanbul ignore next
      return new f.Response(undefined, { status: 404 })
    },
    {
      specs,
      scenarios
    }
  )
}

function extractUri(url: string) {
  const match = /https?:\/\/\w*:\d+\/(.*)/.exec(url)
  // istanbul ignore next
  if (!match) throw match
  return match[1]
}
