import { defineConfig } from 'vitest/config'

const specs = 'ts/**/*.{spec,test,unit,accept,integrate,system}.ts'

/**
 * Two projects, matching the two jest projects this replaces: every spec runs once under
 * node and once under jsdom, and `*.jsdom.ts` specs run under jsdom only.
 */
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
					include: [specs, 'ts/**/*.{spec,test,unit,accept,integrate,system}.jsdom.ts']
				}
			}
		],
		coverage: {
			provider: 'v8',
			include: ['ts/**/*.ts'],
			exclude: [
				'ts/**/*.{spec,test,unit,accept,integrate,system}.ts',
				'ts/**/*.{spec,test,unit,accept,integrate,system}.jsdom.ts',
				'ts/**/*.test-setup.ts',
				'ts/test-artifacts/**'
			],
			reporter: ['text', 'lcov'],
			// Set to what the suite already achieves, so a regression fails the build instead of
			// quietly reporting a lower number.
			thresholds: { statements: 99, branches: 96, functions: 98, lines: 99 }
		}
	}
})
