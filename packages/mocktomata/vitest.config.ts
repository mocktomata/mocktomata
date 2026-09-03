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
			// A couple of points under what the suite currently achieves. v8's numbers move slightly
			// between Node versions — `@mocktomata/nodejs` reports 98.97% statements on Node 26 and
			// 97.95% on Node 24 — so a threshold pinned to one run's exact figure fails the others.
			// This still fails a real regression: dropping one branch moves these by ten points.
			thresholds: { statements: 63, branches: 48, functions: 41, lines: 64 }
		}
	}
})
