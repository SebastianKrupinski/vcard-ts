import { VPropertyUriValue } from "./VPropertyUriValue"

export class VPropertyUriGeoValue extends VPropertyUriValue {

	private _latitude: number
	private _longitude: number

	constructor(latitude: number = 0, longitude: number = 0) {
		super('geo', `${latitude};${longitude}`)
		this._latitude = latitude
		this._longitude = longitude
	}

	deserialize(value: string): VPropertyUriGeoValue {
		const isUri = value.startsWith('geo:')
		const coordinates = isUri
			? value.slice(4).split(';', 1)[0].split(',', 2)
			: value.split(';', 2)
		const [lat, lon] = coordinates
		this._latitude = parseFloat(lat) || 0
		this._longitude = parseFloat(lon) || 0
		return this
	}

	serialize(): string {
		return `${this._latitude};${this._longitude}`
	}

	get latitude(): number {
	    return this._latitude
	}

	set latitude(value: number) {
	    this._latitude = value
	}

	get longitude(): number {
	    return this._longitude
	}

	set longitude(value: number) {
	    this._longitude = value
	}

}
