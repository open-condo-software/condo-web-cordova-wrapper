import bridge from '@open-condo/bridge'
import { wrapPromiseWithCallbacks, sendCordovaMessage } from '../utils'
import type { CordovaWebPlugin, SuccessCallback, ErrorCallback } from '../types'

export class CondoWebPlugin implements CordovaWebPlugin {
	name = 'condo'

	requestServerAuthorizationByUrl(
		url: string,
		_options: Record<string, never>,
		success: SuccessCallback,
		error: ErrorCallback,
	) {
		wrapPromiseWithCallbacks(
			bridge.send('CondoWebAppRequestAuth', { url }).then((data) => data.response),
			success,
			error,
		)
	}

	// TODO: deprecate this method, since each app must request its own fields via API after auth
	getCurrentResident(success: SuccessCallback, error: ErrorCallback) {
		wrapPromiseWithCallbacks(
			sendCordovaMessage('condo-cordova-legacy', 'CondoWebAppGetCurrentResident', {}, 10_000),
			success,
			error,
		)
	}

	// TODO: implement me later?
	closeApplication(success: SuccessCallback, _error: ErrorCallback) {
		success(true)
	}

	getLaunchContext(success: SuccessCallback, error: ErrorCallback) {
		wrapPromiseWithCallbacks(
			bridge.send('CondoWebAppGetFragment').then((data) => data.fragment ?? null),
			success,
			error,
		)
	}

	setInputsEnabled(value: boolean, success: SuccessCallback, _error: ErrorCallback) {
		success(value)
	}

	// TODO: migrate to bridge and add docs, since it will be stable API
	history = {
		pushState(state: unknown, title: string, success: SuccessCallback, error: ErrorCallback) {
			wrapPromiseWithCallbacks(
				sendCordovaMessage('condo-cordova', 'CondoWebAppPushHistoryState', {
					state,
					title,
				}),
				success,
				error,
			)
		},
		replaceState(state: unknown, title: string, success: SuccessCallback, error: ErrorCallback) {
			wrapPromiseWithCallbacks(
				sendCordovaMessage('condo-cordova', 'CondoWebAppReplaceHistoryState', {
					state,
					title,
				}),
				success,
				error,
			)
		},
		back(success: SuccessCallback, error: ErrorCallback) {
			wrapPromiseWithCallbacks(
				sendCordovaMessage('condo-cordova', 'CondoWebAppPopHistoryState', {
					amount: 1,
				}),
				success,
				error,
			)
		},
		go(amount: number, success: SuccessCallback, error: ErrorCallback) {
			wrapPromiseWithCallbacks(
				sendCordovaMessage('condo-cordova', 'CondoWebAppPopHistoryState', {
					amount: -amount,
				}),
				success,
				error,
			)
		},
	}
}
