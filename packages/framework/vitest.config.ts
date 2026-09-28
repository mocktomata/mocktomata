import { configDefaults, defineConfig } from 'vitest/config'

const specs = 'ts/**/*.{spec,test,unit,accept,integrate,system}.ts'

// `*.online.spec.ts` specs call a live third-party endpoint, so their outcome depends on that
// service, not on this code. They stay out of the default run (and CI); `pnpm test:online` runs them.
const online = process.env.MOCKTOMATA_ONLINE ? [] : ['ts/**/*.online.spec.ts']

/**
 * Two projects, matching the two jest projects this replaces: every spec runs once under
 * node and once under jsdom, and `*.jsdom.ts` specs run under jsdom only.
 */
export default defineConfig({
	test: {
		// The online specs record against a live HTTP endpoint in `save` mode, so the runner's
		// network latency, not the code, decides whether the 5s default is enough.
		testTimeout: 15_000,
		exclude: [...configDefaults.exclude, ...online],
		projects: [
			{
				extends: true,
				test: {
					name: 'nodejs',
					globals: true,
					environment: 'node',
					include: [specs]
				}
			},
			{
				extends: true,
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
			// A couple of points under what the suite currently achieves. v8's numbers move slightly
			// between Node versions — `@mocktomata/nodejs` reports 98.97% statements on Node 26 and
			// 97.95% on Node 24 — so a threshold pinned to one run's exact figure fails the others.
			// This still fails a real regression: dropping one branch moves these by ten points.
			thresholds: { statements: 97, branches: 94, functions: 96, lines: 97 }
		}
	}
})
