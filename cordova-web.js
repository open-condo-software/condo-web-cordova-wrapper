// Track if deviceready has been fired
let deviceReadyFired = false

// Function to fire the deviceready event
function fireDeviceReady () {
    const event = new Event('deviceready')
    document.dispatchEvent(event)
    deviceReadyFired = true
    console.debug('Cordova mock: deviceready event fired')
}

function fireBackButton () {
    const event = new Event('backbutton')
    document.dispatchEvent(event)
    console.debug('Cordova mock: backbutton event fired')
}

function wrapPromiseWithCallbacks(promise, success, error) {
    promise.then(success).catch(error)
}

async function sendCordovaMessage(type, handler, data, timeout = 1_000) {
    return new Promise((resolve, reject) => {
        const requestId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

        const payload = {
            handler,
            params: {
                ...data,
                requestId,
            },
            type,
            version: '0.0.0-cordova-web-wrapper',
        }

        const timeoutId = setTimeout(() => {
            window.removeEventListener('message', messageHandler)
            reject(new Error(`PostMessage timeout after ${timeout}ms for event: ${handler}`))
        }, timeout)

        const messageHandler = (event) => {
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

// Store original addEventListener to intercept deviceready listeners
const originalAddEventListener = document.addEventListener.bind(document)

// Override document.addEventListener to handle late deviceready listeners
document.addEventListener = function(type, listener, options) {
    // Call the original addEventListener first
    originalAddEventListener(type, listener, options)
    
    // If someone is adding a deviceready listener after the event has fired, trigger it immediately
    if (type === 'deviceready' && deviceReadyFired && typeof listener === 'function') {
        console.debug('Cordova mock: Immediately firing deviceready for late listener')
        // Use setTimeout to make it asynchronous like the real event
        setTimeout(() => {
            const event = new Event('deviceready')
            listener(event)
        }, 0)
    }
}

window.addEventListener('message', (evt) => {
    const data = evt.data
    if (data && typeof data === 'object' && Object.hasOwn(data, 'eventName') && data.eventName === 'backbutton') {
        fireBackButton()
    }
})

window.cordova = {
    platformId: 'web',
    plugins: {
        condo: {
            requestServerAuthorizationByUrl (url, _options, success, error) {
                wrapPromiseWithCallbacks(
                    sendCordovaMessage('condo-bridge', 'CondoWebAppRequestAuth', { url }, 10_000),
                    success, error
                )
            },
            getCurrentResident (success, error) {
                wrapPromiseWithCallbacks(
                    sendCordovaMessage('condo-cordova-legacy', 'CondoWebAppGetCurrentResident', {}, 10_000),
                    success, error
                )
            },
            closeApplication (success, error) {
                success(true)
                // wrapPromiseWithCallbacks(
                //     sendCordovaMessage('condo-cordova', 'CondoWebAppCloseApplication', {}),
                //     success, error
                // )
            },
            getLaunchContext (success, _error) {
                success(null)
            },
            setInputsEnabled (value, success, _error) {
                success(value)
            },
            history: {
                pushState (state, title, success, error) {
                    wrapPromiseWithCallbacks(
                        sendCordovaMessage('condo-cordova', 'CondoWebAppPushHistoryState', {
                            state,
                            title,
                        }),
                        success, error
                    )
                },
                replaceState (state, title, success, error) {
                    wrapPromiseWithCallbacks(
                        sendCordovaMessage('condo-cordova', 'CondoWebAppReplaceHistoryState', {
                            state,
                            title,
                        }),
                        success, error
                    )
                },
                back (success, error) {
                    wrapPromiseWithCallbacks(
                        sendCordovaMessage('condo-cordova', 'CondoWebAppPopHistoryState', {
                            amount: 1,
                        }),
                        success, error
                    )
                },
                go (amount, success, error) {
                    wrapPromiseWithCallbacks(
                        sendCordovaMessage('condo-cordova', 'CondoWebAppPopHistoryState', {
                            amount: -amount,
                        }),
                        success, error
                    )
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