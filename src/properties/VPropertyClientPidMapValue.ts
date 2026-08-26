import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyClientPidMapValue {

	private _sourceId: number | null
	private _uri: VPropertyUriValue | null

	constructor(sourceId: number | null = null, uri: VPropertyUriValue | null = null) {
		this._sourceId = null
		this.sourceId = sourceId
		this._uri = uri
	}

	deserialize(value: string): VPropertyClientPidMapValue {
		const separator = value.indexOf(';')
		if (separator === -1) {
			this._sourceId = null
			this._uri = null
			return this
		}

		const sourceId = value.slice(0, separator)
		this.sourceId = /^[1-9]\d*$/.test(sourceId) ? Number(sourceId) : null
		this._uri = new VPropertyUriValue().deserialize(value.slice(separator + 1))
		return this
	}

	serialize(): string {
		if (this._sourceId === null || this._uri === null) return ''
		return `${this._sourceId};${this._uri.serialize()}`
	}

	get sourceId(): number | null {
		return this._sourceId
	}

	set sourceId(value: number | null) {
		this._sourceId = value !== null && Number.isSafeInteger(value) && value > 0
			? value
			: null
	}

	get uri(): VPropertyUriValue | null {
		return this._uri
	}

	set uri(value: VPropertyUriValue | null) {
		this._uri = value
	}

}
