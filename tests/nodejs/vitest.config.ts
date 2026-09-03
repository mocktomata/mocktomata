import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Several specs here record against a live HTTP endpoint in `save` mode, so the runner's
		// network latency, not the code, decides whether the 5s default is enough.
		testTimeout: 15_000,
		globals: true,
		environment: 'node',
		include: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts'],
		coverage: {
			provider: 'v8',
			include: ['ts/**/*.ts'],
			exclude: ['ts/**/*.{spec,test,unit,accept,integrate,system}.ts'],
			reporter: ['text', 'lcov']
		}
	}
})
