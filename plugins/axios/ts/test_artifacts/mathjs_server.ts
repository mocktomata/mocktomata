import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

const results: Record<string, string> = { '2*(7-3)': '8' }

/**
 * Starts a local stand-in for `http://api.mathjs.org/v4/` on a free port.
 *
 * It answers the expressions the offline specs send the way mathjs does, including the CORS
 * headers the jsdom XHR adapter needs, so the specs exercise a real HTTP round trip without
 * depending on the live endpoint.
 */
export async function startMathjsServer() {
	const server = createServer((req, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
		if (req.method === 'OPTIONS') {
			res.writeHead(204).end()
			return
		}
		if (req.method === 'POST') {
			let body = ''
			req.on('data', (chunk) => {
				body += chunk
			})
			req.on('end', () => {
				const result = results[JSON.parse(body).expr]
				res.writeHead(result ? 200 : 400, { 'Content-Type': 'application/json; charset=utf-8' })
				res.end(JSON.stringify(result ? { result, error: null } : { result: null, error: 'unknown expression' }))
			})
			return
		}
		const result = results[new URL(req.url!, 'http://localhost').searchParams.get('expr')!]
		res.writeHead(result ? 200 : 400, { 'Content-Type': 'text/html; charset=utf-8' })
		res.end(result ?? 'Error: unknown expression')
	})
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
	const { port } = server.address() as AddressInfo
	return {
		url: `http://127.0.0.1:${port}/v4/`,
		close() {
			server.closeAllConnections()
			return new Promise<void>((resolve) => server.close(() => resolve()))
		}
	}
}
