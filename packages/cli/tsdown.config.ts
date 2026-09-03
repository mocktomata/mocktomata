import { defineConfig } from 'tsdown'

/**
 * ESM only, one file per source module into `lib/` — the shape `tsc` emitted, so neither the
 * `bin` entry nor any other published path moves.
 */
export default defineConfig({
	entry: [
		'ts/**/*.ts',
		'!ts/**/*.{spec,test,unit,accept,integrate,system}.ts',
		'!ts/**/*.{spec,test,unit,accept,integrate,system}.*.ts'
	],
	format: 'esm',
	outDir: 'lib',
	platform: 'node',
	unbundle: true,
	dts: { sourcemap: true },
	sourcemap: true,
	outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
	clean: ['lib']
})
