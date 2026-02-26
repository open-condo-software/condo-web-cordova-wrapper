import bridge from '@open-condo/bridge'
import { wrapPromiseWithCallbacks, sendCordovaMessage } from '../utils'
import type { CordovaWebPlugin, SuccessCallback, ErrorCallback } from '../types'

class CondoHostApplication {
	private _deviceID: string = ''
	private _locale: string = 'ru'

	async _init() {
		bridge.send('CondoWebAppGetLaunchParams').then((data) => {
			if (data.condoDeviceId) this._deviceID = data.condoDeviceId
			if (data.condoLocale) this._locale = data.condoLocale
		})
	}

	baseURL() {
		return process.env.CONDO_BASE_URL || 'https://condo.example.com'
	}

	installationID() {
		return this._deviceID
	}

	deviceID() {
		return this._deviceID
	}

	locale() {
		return this._locale
	}

	isDemoEnvironment() {
		const u = new URL(this.baseURL())
		return !u.hostname.startsWith('v1.')
	}
}

export class CondoWebPlugin implements CordovaWebPlugin {
	name = 'condo'

	hostApplication = new CondoHostApplication()

	async _init() {
		await this.hostApplication._init()
	}

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
			sendCordovaMessage('condo-cordova-legacy', 'CondoWebAppGetCurrentResident', {}, 10_000).then(
				(data: any) => data?.resident,
			),
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
			bridge.send('CondoWebAppGetFragment').then((data) => data.fragment || null),
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
