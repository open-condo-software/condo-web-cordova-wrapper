// Function to fire the deviceready event
function fireDeviceReady () {
    const event = new Event('deviceready')
    document.dispatchEvent(event)
    console.debug('Cordova mock: deviceready event fired')
}

function fireEvent (eventName, eventData, success, error, timeout = 1000) {
    sendPostMessage(eventName, eventData, timeout).then(success).catch(error)
}

async function sendPostMessage (eventName, eventData, timeout = 1000) {
    return new Promise((resolve, reject) => {
        // Generate unique event ID
        const eventId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        
        // Create payload
        const payload = {
            eventId,
            eventName,
            eventData,
        }
        
        // Set up timeout
        const timeoutId = setTimeout(() => {
            window.removeEventListener('message', messageHandler)
            reject(new Error(`PostMessage timeout after ${timeout}ms for event: ${eventName}`))
        }, timeout)
        
        // Message handler for response
        const messageHandler = (event) => {
            const response = event.data
            
            // Check if this is the response we're waiting for
            if (response && response.eventId === eventId) {
                clearTimeout(timeoutId)
                window.removeEventListener('message', messageHandler)
                
                if (response.error) {
                    reject(new Error(response.error))
                } else {
                    resolve(response.result)
                }
            }
        }
        
        // Listen for response
        window.addEventListener('message', messageHandler)
        
        // Send message to parent window
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(payload, '*')
        } else {
            clearTimeout(timeoutId)
            window.removeEventListener('message', messageHandler)
            reject(new Error('No parent window available'))
        }
    })
}

window.cordova = {
    platformId: 'web',
    plugins: {
        condo: {
            requestServerAuthorizationByUrl (url, _options, success, error) {
                fireEvent('requestServerAuthorizationByUrl', { url }, success, error, 10_000)
            },
            getCurrentResident (success, error) {
                fireEvent('getCurrentResident', {}, success, error, 5_000)
            },
            closeApplication (success, error) {
                fireEvent('closeApplication', {}, success, error)
            },
            getLaunchContext (success, _error) {
                success(null)
            },
            setInputsEnabled (value, success, _error) {
                success(value)
            },
            history: {
                pushState (state, title) {
                    sendPostMessage('pushHistoryState', { state, title })
                },
                replaceState (state, title) {
                    sendPostMessage('replaceHistoryState', { state, title })
                },
                back () {
                    sendPostMessage('popHistoryState', { amount: -1 })
                },
                go (amount) {
                    sendPostMessage('popHistoryState', { amount })
                },
            },
        },
    },
}

// Wait for all scripts to load, then fire deviceready event
if (document.readyState === 'loading') {
    // If the document is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // Use setTimeout to ensure all deferred scripts have executed
        setTimeout(fireDeviceReady, 0)
    })
} else {
    // If document is already loaded, fire immediately
    setTimeout(fireDeviceReady, 0)
}