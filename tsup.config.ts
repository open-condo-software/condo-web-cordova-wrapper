import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['iife'],
	outDir: 'dist',
	clean: true,
	minify: true,
	sourcemap: true,
	target: 'es2020',
	globalName: 'CordovaWeb',
	platform: 'browser',
	noExternal: [/.*/], // Bundle everything
})
