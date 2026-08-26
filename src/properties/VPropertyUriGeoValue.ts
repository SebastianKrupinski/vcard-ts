import { VPropertyUriValue } from "./VPropertyUriValue"

export class VPropertyUriGeoValue extends VPropertyUriValue {

	private _latitude: number
	private _longitude: number
	private _uri: boolean

	constructor(latitude: number = 0, longitude: number = 0, uri = true) {
		super('geo', `${latitude};${longitude}`)
		this._latitude = latitude
		this._longitude = longitude
		this._uri = uri
	}

	deserialize(value: string): VPropertyUriGeoValue {
		this._uri = /^geo:/i.test(value)
		const coordinates = this._uri
			? value.slice(4).split(';', 1)[0].split(',', 2)
			: value.split(';', 2)
		const [lat, lon] = coordinates
		this._latitude = parseFloat(lat) || 0
		this._longitude = parseFloat(lon) || 0
		return this
	}

	serialize(): string {
		return this._uri
			? `geo:${this._latitude},${this._longitude}`
			: `${this._latitude};${this._longitude}`
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

	get uri(): boolean {
		return this._uri
	}

	set uri(value: boolean) {
		this._uri = value
	}

}
