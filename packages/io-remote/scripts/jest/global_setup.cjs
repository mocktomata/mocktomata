const { globalSetup } = require('@mocktomata/service/testing')

module.exports = async function () {
	await globalSetup(3699)
}
