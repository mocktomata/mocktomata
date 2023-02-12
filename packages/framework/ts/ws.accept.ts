import * as ws from 'ws'
import { incubator } from './incubator/index.js'

incubator('open-close', (specName, spec) => {
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

incubator('echo using ws', (specName, spec) => {
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
