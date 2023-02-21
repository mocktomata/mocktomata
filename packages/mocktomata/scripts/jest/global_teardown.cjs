const { globalTeardown } = require('@mocktomata/service/testing')

module.exports = async function () {
	await globalTeardown()
}
