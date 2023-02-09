const watch = require('./.jest/jest.watch')

const projects = process.env.JEST_ENV
	? [
		`<rootDir>/packages/*/jest.config${process.env.JEST_ENV === 'nodejs' ? '' : '.' + process.env.JEST_ENV
		}.cjs`
	]
	: [
		'<rootDir>/packages/*/jest.config.mjs'
		// '<rootDir>/packages/*/jest.config.electron.js',
		// '<rootDir>/packages/*/jest.config.jsdom.cjs'
	]
module.exports = {
	collectCoverageFrom: ['<rootDir>/ts/**/*.[jt]s', '!<rootDir>/ts/bin.[jt]s', '!<rootDir>/ts/**/*.spec.*'],
	projects,
	...watch
}
