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
			// A couple of points under what the suite currently achieves. v8's numbers move slightly
			// between Node versions — `@mocktomata/nodejs` reports 98.97% statements on Node 26 and
			// 97.95% on Node 24 — so a threshold pinned to one run's exact figure fails the others.
			// This still fails a real regression: dropping one branch moves these by ten points.
			thresholds: { statements: 76, branches: 98, functions: 73, lines: 80 }
		}
	}
})
