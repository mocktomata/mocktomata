import { start } from '@mocktomata/service'

(async () => {
	const server = await start({ port: 3698 })
	console.info(server.info)
})()
