const { start } = require('@mocktomata/service')

module.exports = async function () {
	const server = await start({ port: 3699 })
	console.info(server.info)
	// eslint-disable-next-line no-undef
	globalThis.__SERVER__ = server
}
