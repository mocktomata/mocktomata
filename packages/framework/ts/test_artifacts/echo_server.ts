import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

/**
 * Starts a local stand-in for `http://postman-echo.com/get` on a free port.
 *
 * It answers `GET /get?...` with the query string as `{ args }`, the part of postman-echo's
 * response the offline specs read, so they exercise a real HTTP round trip without the network.
 */
export async function startEchoServer() {
	const server = createServer((req, res) => {
		const url = new URL(req.url!, 'http://localhost')
		res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
		res.end(JSON.stringify({ args: Object.fromEntries(url.searchParams), url: url.href }))
	})
	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
	const { port } = server.address() as AddressInfo
	return {
		url: `http://127.0.0.1:${port}`,
		close() {
			server.closeAllConnections()
			return new Promise<void>((resolve) => server.close(() => resolve()))
		}
	}
}
