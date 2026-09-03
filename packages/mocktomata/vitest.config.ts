import { defineConfig } from 'vitest/config'

const specs = 'ts/**/*.{spec,test,unit,accept,integrate,system}.ts'

/**
 * The browser specs under `ts/browser` used to run only in the electron renderer, which vitest
 * has no equivalent of. They run under jsdom instead — the same browser-shaped globals, without
 * the extra process — while the node project keeps skipping them.
 */
export default defineConfig({
	test: {
		globalSetup: ['./scripts/vitest/global-setup.ts'],
		projects: [
			{
				test: {
					name: 'nodejs',
					globals: true,
					environment: 'node',
					include: [specs],
					exclude: ['ts/browser/**']
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
			thresholds: { statements: 65, branches: 50, functions: 43, lines: 66 }
		}
	}
})
