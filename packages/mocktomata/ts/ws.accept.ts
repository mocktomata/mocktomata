import * as ws from 'ws'
import { mockto } from './index.js'

// While normally I should use `incubator`,
// or test it under `framework`,
// this needs a local echo-server to be up.
// see https://www.lob.com/blog/websocket-org-is-down-here-is-an-alternative
// on how to setup an echo-server locally to test this.
//
// Due to this, I won't be able to making the actual call during CI.
// so I resort to just doing simulation here.

mockto('open-close', (specName, spec) => {
	it(specName, async () => {
		const WS = await spec(ws.WebSocket)
		const c = new WS('ws://localhost:10000')
		await new Promise<void>(a => {
			c.on('open', () => c.close())
			c.on('close', a)
		})

		await spec.done()
	})
})

mockto('echo using ws', (specName, spec) => {
	it(specName, async () => {
		const WS = await spec(ws.WebSocket)

		const messages = await new Promise<string[]>(a => {
			const messages: string[] = []
			const conn = new WS('ws://localhost:10000')
			conn.on('open', () => {
				conn.send('hello')
				conn.close()
			})
			conn.on('message', function (data) {
				messages.push(data.toString())
			})
			conn.on('close', () => a(messages))
		})
		expect(messages[1]).toEqual('hello')
		await spec.done()
	})
})
