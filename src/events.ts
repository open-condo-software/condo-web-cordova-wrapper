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
	// TODO: replace with bridge.subscribe once history API migrated to bridge
	window.addEventListener('message', (evt) => {
		const data = evt.data
		if (
			data &&
			typeof data === 'object' &&
			Object.hasOwn(data, 'type') &&
			data.type === 'CondoWebAppBackButtonEvent'
		) {
			fireEvent('backbutton')
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
