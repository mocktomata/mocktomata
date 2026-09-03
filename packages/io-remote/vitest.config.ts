import { defineConfig } from 'vitest/config'

/**
 * These specs used to run under `@kayahr/jest-electron-runner`'s renderer, purely to get a
 * browser-shaped global scope; nothing here touches an Electron API. vitest has no electron
 * runner, so they run under jsdom, which provides the same globals without the extra process.
 */
export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts'],
		globalSetup: ['./scripts/vitest/global-setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['ts/**/*.ts'],
			exclude: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts', 'ts/**/*.mock.ts'],
			reporter: ['text', 'lcov'],
			// A couple of points under what the suite currently achieves. v8's numbers move slightly
			// between Node versions — `@mocktomata/nodejs` reports 98.97% statements on Node 26 and
			// 97.95% on Node 24 — so a threshold pinned to one run's exact figure fails the others.
			// This still fails a real regression: dropping one branch moves these by ten points.
			thresholds: { statements: 89, branches: 73, functions: 68, lines: 89 }
		}
	}
})
