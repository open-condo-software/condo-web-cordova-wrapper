import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

const commonConfig: Options = {
	format: ['iife'],
	outDir: 'dist',
	clean: true,
	minify: true,
	sourcemap: false,
	target: 'es2020',
	globalName: 'CordovaWeb',
	platform: 'browser',
	noExternal: [/.*/], // Bundle everything
}

export default defineConfig([
	{
		...commonConfig,
		entry: { dev: 'src/index.ts' },
		define: {
			'process.env.CONDO_BASE_URL': JSON.stringify('https://condo.d.doma.ai'),
		},
	},
	{
		...commonConfig,
		entry: { prod: 'src/index.ts' },
		define: {
			'process.env.CONDO_BASE_URL': JSON.stringify('https://v1.doma.ai'),
		},
	},
])
