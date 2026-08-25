import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyUriValue {

	private _scheme: string
	private _reference: string

	constructor(scheme: string = '', reference: string = '') {
		this._scheme = scheme
		this._reference = reference
	}

	deserialize(value: string): VPropertyUriValue {
		const separator = value.indexOf(':')
		if (separator === -1) {
			this._scheme = ''
			this._reference = value
		} else {
			this._scheme = value.slice(0, separator)
			this._reference = value.slice(separator + 1)
		}
		return this
	}

	serialize(): string {
		return `${this._scheme}:${this._reference}`
	}

	type(): string {
		return VParameterValueOptions.URI
	}

	get scheme(): string {
		return this._scheme
	}

	set scheme(value: string) {
		this._scheme = value
	}

	get reference(): string {
		return this._reference
	}

	set reference(value: string) {
		this._reference = value
	}

}
