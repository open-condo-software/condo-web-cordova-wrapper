import bridge from '@open-condo/bridge'

function setupResizeObserver() {
	const observer = new ResizeObserver((entries) => {
		if (entries && entries.length) {
			bridge.send('CondoWebAppResizeWindow', {
				height: entries[0].target.clientHeight,
			})
		}
	})
	observer.observe(document.body)
}

export function initializeResizeObserver() {
	if (document.body) {
		document.body.style.height = 'auto'
		setupResizeObserver()
	} else {
		// If body is not ready yet, wait for it
		const bodyObserver = new MutationObserver(() => {
			if (document.body) {
				bodyObserver.disconnect()
				document.body.style.height = 'auto'
				setupResizeObserver()
			}
		})
		bodyObserver.observe(document.documentElement, { childList: true })
	}
}
