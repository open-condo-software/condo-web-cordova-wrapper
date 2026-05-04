import bridge from '@open-condo/bridge'

const _firedEvents = new Set()

export function fireEvent(eventName: string, eventData?: Record<string, unknown>, markAsFired?: boolean) {
	const event = new CustomEvent(eventName, { detail: eventData })
	document.dispatchEvent(event)
	if (markAsFired) {
		_firedEvents.add(eventName)
	}
	console.debug(`Cordova mock: event "${eventName}" is fired`)
}

export function addEventListeners() {
	bridge.subscribe((event) => {
		if (event.type === 'CondoWebAppBackButtonEvent') {
			fireEvent('backbutton')
		}
		if (event.type === 'CondoWebAppHistoryPopStateEvent') {
			fireEvent('condoPopstate', { state: event?.data?.state, title: event?.data?.title })
		}
	})

	const originalAddEventListener = document.addEventListener.bind(document)
	document.addEventListener = function (
		type: string,
		listener: EventListenerOrEventListenerObject,
		options: boolean | AddEventListenerOptions,
	) {
		// Call the original addEventListener first
		originalAddEventListener(type, listener, options)

		// If event was previously fired (like deviceready), we need to fire it immediately
		if (_firedEvents.has(type) && typeof listener === 'function') {
			console.debug(`Cordova mock: Immediately firing "${type}" for late listener`)
			// Use setTimeout to make it asynchronous like the real event
			setTimeout(() => {
				const event = new Event(type)
				listener(event)
			}, 0)
		}
	}
}
