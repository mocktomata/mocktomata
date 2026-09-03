import { defineConfig } from 'vitest/config'

const specs = 'ts/**/*.{spec,test,unit,accept,integrate,system}.ts'

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'nodejs',
					globals: true,
					environment: 'node',
					include: [specs]
				}
			},
			{
				test: {
					name: 'jsdom',
					globals: true,
					environment: 'jsdom',
					include: [specs]
				}
			}
		],
		coverage: {
			provider: 'v8',
			include: ['ts/**/*.ts'],
			exclude: [specs],
			reporter: ['text', 'lcov'],
			// Set to what the suite already achieves, so a regression fails the build instead of
			// quietly reporting a lower number.
			thresholds: { statements: 72, branches: 75, functions: 53, lines: 85 }
		}
	}
})
