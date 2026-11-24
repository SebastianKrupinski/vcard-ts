import { VPropertyUriValue } from './VPropertyUriValue'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyValueBase } from './VPropertyValueBase'

export class VPropertyClientPidMapValue extends VPropertyValueBase {

	private _sourceId: number | null
	private _uri: VPropertyUriValue | null
	private _sourceIdText: string | null = null

	constructor(sourceId: number | null = null, uri: VPropertyUriValue | null = null) {
		super()
		this._sourceId = null
		this.sourceId = sourceId
		this._uri = uri
	}

	deserialize(value: string): VPropertyClientPidMapValue {
		const separator = value.indexOf(';')
		const sourceIdText = value.slice(0, separator)
		const sourceId = /^\d+$/.test(sourceIdText) ? Number(sourceIdText) : NaN
		const uri = value.slice(separator + 1)
		if (separator === -1 || !Number.isSafeInteger(sourceId) || sourceId <= 0
			|| !/^[a-z][a-z0-9+.-]*:/i.test(uri) || /\s/.test(value)) {
			throw new Error(`Invalid CLIENTPIDMAP value: ${value}`)
		}

		this.sourceId = sourceId
		this._sourceIdText = sourceIdText
		this._uri = new VPropertyUriValue().deserialize(uri)
		return this
	}

	serialize(): string {
		if (this._sourceId === null || this._uri === null
			|| !/^[a-z][a-z0-9+.-]*$/i.test(this._uri.scheme) || /\s/.test(this._uri.serialize())) {
			throw new Error('Invalid CLIENTPIDMAP value: expected a positive source identifier and an absolute URI')
		}
		return `${this._sourceIdText ?? this._sourceId};${this._uri.serialize()}`
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}

	get sourceId(): number | null {
		return this._sourceId
	}

	set sourceId(value: number | null) {
		this._sourceIdText = null
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
