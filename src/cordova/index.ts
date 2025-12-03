import type { CordovaWebPlugin } from './types'

export class CordovaWeb {
	platformId = 'web'
	plugins: Record<string, CordovaWebPlugin> = {}

	constructor(plugins: Array<CordovaWebPlugin>) {
		for (const plugin of plugins) {
			this.plugins[plugin.name] = plugin
		}
	}

	async _init() {
		const initFns = []
		for (const plugin of Object.values(this.plugins)) {
			if (plugin._init) {
				initFns.push(plugin._init())
			}
		}
		await Promise.allSettled(initFns)
	}
}
