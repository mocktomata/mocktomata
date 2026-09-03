import { defineConfig } from 'tsdown'

/**
 * ESM only. `esm/*.js` + `esm/*.d.ts`, one file per source module (`unbundle`) — the shape
 * `tsc` emitted, so no published ESM path moves.
 */
export default defineConfig({
	entry: [
		'ts/**/*.ts',
		'!ts/**/*.{spec,test,unit,accept,integrate,system}.ts',
		'!ts/**/*.{spec,test,unit,accept,integrate,system}.*.ts',
		'!ts/**/*.test-setup.ts',
		'!ts/**/testutils/**',
		'!ts/**/test-util/**',
		'!ts/**/test_util/**',
		'!ts/**/test-artifacts/**',
		'!ts/**/test_artifacts/**'
	],
	format: 'esm',
	outDir: 'esm',
	platform: 'node',
	unbundle: true,
	dts: { sourcemap: true },
	sourcemap: true,
	outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
	clean: ['esm']
})
