const { globalSetup } = require('@mocktomata/service/testing')

module.exports = async function () {
	await globalSetup({
		cwd: './fixtures/service'
	})
	await globalSetup({
		cwd: './fixtures/es2015',
		port: 3699
	})
}
