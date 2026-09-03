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
			// Set to what the suite already achieves, so a regression fails the build instead of
			// quietly reporting a lower number.
			thresholds: { statements: 91, branches: 75, functions: 70, lines: 91 }
		}
	}
})
