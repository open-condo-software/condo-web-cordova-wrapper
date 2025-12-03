import { CordovaWeb } from './cordova'
import { CondoWebPlugin } from './cordova/plugins'
import { addEventListeners, fireEvent } from './events'
import { initializeResizeObserver } from './resizer'

async function initApplicationMocks() {
	initializeResizeObserver()
	addEventListeners()

	const cordova = new CordovaWeb([new CondoWebPlugin()])
	await cordova._init()
	;(window as any).cordova = cordova

	fireEvent('deviceready', {}, true)
}

// Wait for all scripts to load, then fire deviceready event
if (document.readyState === 'loading') {
	// If the document is still loading, wait for DOMContentLoaded
	document.addEventListener('DOMContentLoaded', () => {
		// Use setTimeout to ensure all deferred scripts have executed
		setTimeout(() => {
			initApplicationMocks()
		}, 0)
	})
} else {
	// If document is already loaded, fire immediately
	setTimeout(() => {
		initApplicationMocks()
	}, 0)
}
