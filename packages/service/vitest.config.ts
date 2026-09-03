import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts'],
		coverage: {
			provider: 'v8',
			include: ['ts/**/*.ts'],
			exclude: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts'],
			reporter: ['text', 'lcov'],
			// Set to what the suite already achieves, so a regression fails the build instead of
			// quietly reporting a lower number.
			thresholds: { statements: 82, branches: 16, functions: 81, lines: 86 }
		}
	}
})
