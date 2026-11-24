import { keepableSource } from "../codecs/contentLine"
import { formatDate, parseDate } from "../codecs/temporal"
import { VCardVersion } from "../VCardInterfaces"
import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { VPropertyValueBase } from "./VPropertyValueBase"

export class VPropertyDateValue extends VPropertyValueBase {

	private _year: number | null
	private _month: number | null
	private _day: number | null
	private _source: string | null = null

	constructor(year?: number | null, month?: number | null, day?: number | null) {
		super()
		this._year = year ?? null
		this._month = month ?? null
		this._day = day ?? null
	}

	deserialize(value: string): VPropertyDateValue {
		const fields = parseDate(value)
		this._year = fields?.year ?? null
		this._month = fields?.month ?? null
		this._day = fields?.day ?? null
		this._source = keepableSource(value)
		return this
	}

	/** Return the text this value was read from, or the standard form once edited. */
	serialize(version: VCardVersion = VCardVersion.V4_0): string {
		return this._source ?? formatDate(
			{ year: this._year, month: this._month, day: this._day },
			version === VCardVersion.V3_0,
		)
	}

	/** Stop writing the original text, so the next serialize uses the standard form. */
	clearSource(): void {
		this._source = null
	}

	type(): string {
		return VParameterValueOptions.DATE
	}

	/** The text this value was read from, or null if it was created or edited in code. */
	get source(): string | null {
		return this._source
	}

	get year(): number | null {
		return this._year
	}

	set year(value: number | null) {
		this._year = value
		this._source = null
	}

	get month(): number | null {
		return this._month
	}

	set month(value: number | null) {
		this._month = value
		this._source = null
	}

	get day(): number | null {
		return this._day
	}

	set day(value: number | null) {
		this._day = value
		this._source = null
	}

}
