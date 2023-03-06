module.exports = {
	moduleNameMapper: {
		'^@mocktomata/(plugin-fixture-.*)': '<rootDir>/../../test-plugins/$1',
		'^@mocktomata/(.*)/(.*)': '<rootDir>/../../packages/$1/ts/$2',
		'^@mocktomata/(.*)': '<rootDir>/../../packages/$1/ts',
		'^mocktomata/(.*)': '<rootDir>/../../packages/mocktomata/ts/$1',
		'^mocktomata': '<rootDir>/../../packages/mocktomata/ts'
	}
}
