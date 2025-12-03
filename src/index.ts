import { CordovaWeb } from './cordova'
import { CondoWebPlugin } from './cordova/plugins'
import { addEventListeners, fireEvent } from './events'
import { initializeResizeObserver } from './resizer'

declare global {
	interface Window {
		cordova: CordovaWeb
	}
}

function initApplicationMocks() {
	initializeResizeObserver()
	addEventListeners()
	window.cordova._init().then(() => fireEvent('deviceready', {}, true))
}

window.cordova = new CordovaWeb([new CondoWebPlugin()])

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
