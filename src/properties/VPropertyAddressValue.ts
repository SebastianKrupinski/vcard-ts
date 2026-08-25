import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { decodePropertyValue, splitPropertyValue } from "../codecs/propertyValue"

export class VPropertyAddressValue {

	private _poBox: string | null
	private _extended: string | null
	private _street: string | null
	private _locality: string | null
	private _region: string | null
	private _postalCode: string | null
	private _country: string | null

	constructor(
		poBox?: string,
		extended?: string,
		street?: string,
		locality?: string,
		region?: string,
		code?: string,
		country?: string,
	) {
		this._poBox = poBox || null
		this._extended = extended || null
		this._street = street || null
		this._locality = locality || null
		this._region = region || null
		this._postalCode = code || null
		this._country = country || null
	}

	deserialize(value: string): VPropertyAddressValue {
		const parts = splitPropertyValue(value, ';').map(decodePropertyValue)
		this._poBox = parts[0] || null
		this._extended = parts[1] || null
		this._street = parts[2] || null
		this._locality = parts[3] || null
		this._region = parts[4] || null
		this._postalCode = parts[5] || null
		this._country = parts[6] || null
		return this
	}

	serialize(): string {
		return [
			this._poBox,
			this._extended,
			this._street,
			this._locality,
			this._region,
			this._postalCode,
			this._country,
		]
		.map((part) => (part === null ? '' : part))
		.join(';')
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}

	get poBox(): string | null {
		return this._poBox
	}

	set poBox(poBox: string | null) {
		this._poBox = poBox
	}

	get extended(): string | null {
		return this._extended
	}

	set extended(extended: string | null) {
		this._extended = extended
	}

	get street(): string | null {
		return this._street
	}

	set street(street: string | null) {
		this._street = street
	}

	get locality(): string | null {
		return this._locality
	}

	set locality(locality: string | null) {
		this._locality = locality
	}

	get region(): string | null {
		return this._region
	}

	set region(region: string | null) {
		this._region = region
	}

}
