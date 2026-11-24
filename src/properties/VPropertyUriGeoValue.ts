import { VPropertyUriValue } from "./VPropertyUriValue"

export class VPropertyUriGeoValue extends VPropertyUriValue {

	private _latitude: number
	private _longitude: number
	private _uri: boolean
	private _source: string | null = null
	private _suffix = ''

	constructor(latitude: number = 0, longitude: number = 0, uri = true) {
		super(uri ? 'geo' : '', uri ? `${latitude},${longitude}` : `${latitude};${longitude}`)
		this._latitude = latitude
		this._longitude = longitude
		this._uri = uri
	}

	deserialize(value: string): VPropertyUriGeoValue {
		const uri = /^geo:/i.test(value)
		const coordinates = uri
			? value.match(/^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(,-?\d+(?:\.\d+)?)?((?:;[^\r\n]*)?)$/i)
			: value.match(/^([+-]?\d+(?:\.\d+)?);([+-]?\d+(?:\.\d+)?)$/)
		if (!coordinates || !Number.isFinite(Number(coordinates[1])) || !Number.isFinite(Number(coordinates[2]))) {
			throw new Error(`Invalid geographic value: ${value}`)
		}
		super.deserialize(value)
		this._uri = uri
		this._latitude = Number(coordinates[1])
		this._longitude = Number(coordinates[2])
		// Keep altitude and URI parameters verbatim when the coordinates change.
		this._suffix = uri ? (coordinates[3] ?? '') + coordinates[4] : ''
		this._source = value
		return this
	}

	serialize(): string {
		if (this._source !== null) return this._source
		return this._uri
			? `geo:${this._latitude},${this._longitude}${this._suffix}`
			: `${this._latitude};${this._longitude}`
	}

	get latitude(): number {
	    return this._latitude
	}

	set latitude(value: number) {
		this._source = null
	    this._latitude = value
	}

	get longitude(): number {
	    return this._longitude
	}

	set longitude(value: number) {
		this._source = null
	    this._longitude = value
	}

	get uri(): boolean {
		return this._uri
	}

	set uri(value: boolean) {
		this._source = null
		this._uri = value
	}

}
