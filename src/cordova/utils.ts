import type { SuccessCallback, ErrorCallback } from './types'

export function wrapPromiseWithCallbacks(
	promise: Promise<unknown>,
	success: SuccessCallback,
	error: ErrorCallback,
): void {
	promise.then(success).catch(error)
}

// TODO: think about extending condo-bridge with custom events protocol
export function sendCordovaMessage(
	eventType: string,
	eventName: string,
	eventData: Record<string, unknown>,
	timeout = 1_000,
): Promise<unknown> {
	return new Promise((resolve, reject) => {
		const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

		const payload = {
			handler: eventName,
			params: {
				...eventData,
				requestId,
			},
			type: eventType,
			version: '1.0.0-cordova-web-wrapper',
		}

		const timeoutId = setTimeout(() => {
			window.removeEventListener('message', messageHandler)
			reject(new Error(`PostMessage timeout after ${timeout}ms for event: ${eventName}`))
		}, timeout)

		const messageHandler = (event: MessageEvent) => {
			const response = event.data

			// Check if this is the response we're waiting for
			if (response && response.data && response.data.requestId === requestId) {
				clearTimeout(timeoutId)
				window.removeEventListener('message', messageHandler)

				if (response.data.errorMessage) {
					reject(response.data)
				} else {
					resolve(response.data)
				}
			}
		}

		window.addEventListener('message', messageHandler)

		// Send message to parent window
		if (window.parent && window.parent !== window) {
			console.log('Sending PM to parent window', payload)
			window.parent.postMessage(payload, '*')
		} else {
			clearTimeout(timeoutId)
			window.removeEventListener('message', messageHandler)
			reject(new Error('No parent window available'))
		}
	})
}
