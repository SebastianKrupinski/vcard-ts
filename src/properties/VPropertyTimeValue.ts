import { formatTime, keepableSource, parseTime } from "../codecs/temporal"
import { VCardVersion } from "../VCardInterfaces"
import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyTimeValue {

	private _hour: number | null = null
	private _minute: number | null = null
	private _second: number | null = null
	private _offset: number | null = null // in minutes, 0 for Z, null for local
	private _source: string | null = null

	constructor(hour: number | null = null, minute: number | null = null, second: number | null = null, offset: number | null = null) {
		this._hour = hour
		this._minute = minute
		this._second = second
		this._offset = offset
	}

	deserialize(value: string): VPropertyTimeValue {
		const fields = parseTime(value)
		this._hour = fields?.hour ?? null
		this._minute = fields?.minute ?? null
		this._second = fields?.second ?? null
		this._offset = fields?.offset ?? null
		this._source = keepableSource(value)
		return this
	}

	/** Return the text this value was read from, or the standard form once edited. */
	serialize(version: VCardVersion = VCardVersion.V4_0): string {
		return this._source ?? formatTime(
			{ hour: this._hour, minute: this._minute, second: this._second, offset: this._offset },
			version === VCardVersion.V3_0,
		)
	}

	/** Stop writing the original text, so the next serialize uses the standard form. */
	clearSource(): void {
		this._source = null
	}

	type(): string {
		return VParameterValueOptions.TIME
	}

	/** The text this value was read from, or null if it was created or edited in code. */
	get source(): string | null {
		return this._source
	}

	get hour(): number | null {
		return this._hour
	}

	set hour(value: number | null) {
		this._hour = value
		this._source = null
	}

	get minute(): number | null {
		return this._minute
	}

	set minute(value: number | null) {
		this._minute = value
		this._source = null
	}

	get second(): number | null {
		return this._second
	}

	set second(value: number | null) {
		this._second = value
		this._source = null
	}

	get offset(): number | null {
		return this._offset
	}

	set offset(value: number | null) {
		this._offset = value
		this._source = null
	}

}
