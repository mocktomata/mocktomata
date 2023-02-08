module.exports = {
	moduleNameMapper: {
		'^@mocktomata/(plugin-fixture-deep-link.*)': '<rootDir>/../../test-plugins/$1',
		'^@mocktomata/(.*)': '<rootDir>/../../packages/$1/ts',
		'^mocktomata': '<rootDir>/../../packages/mocktomata/ts'
	},
	roots: ['<rootDir>/ts']
}
