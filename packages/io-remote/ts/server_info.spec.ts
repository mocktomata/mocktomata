import { a } from 'assertron'
import { ServiceNotAvailable } from './errors.js'
import { getServerInfo } from './server_info.js'

it('throws when server is not available', async () => {
	await a.throws(
		getServerInfo(
			{ fetch: () => Promise.reject({ code: 'ECONNREFUSED' }) },
			{ url: 'http://localhost:4321' }
		),
		ServiceNotAvailable
	)
})

it('calls server with /api/info', async () => {
	const info = await getServerInfo(
		{
			fetch: async (url: RequestInfo) =>
				({
					json() {
						return Promise.resolve({
							name: 'mocktomata',
							url: 'http://mocktomata.com',
							plugins: [url]
						})
					}
				} as any)
		},
		{ url: 'https://mocktomata.com' }
	)
	expect(info.plugins![0]).toBe('https://mocktomata.com/api/info')
})
