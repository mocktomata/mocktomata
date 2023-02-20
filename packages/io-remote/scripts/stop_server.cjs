module.exports = async function () {
	// eslint-disable-next-line no-undef
	await globalThis.__SERVER__.stop()
}
