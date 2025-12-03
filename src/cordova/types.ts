export interface CordovaWebPlugin {
	name: string
	_init?(): Promise<void>
}

export type SuccessCallback = (result: unknown) => void
export type ErrorCallback = (err: Error) => void
