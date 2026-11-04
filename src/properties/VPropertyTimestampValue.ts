import { formatDate, formatTime, keepableSource, parseDate, parseTime } from "../codecs/temporal"
import { VCardVersion } from "../VCardInterfaces"
import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyTimestampValue {

	private _year: number | null = null
	private _month: number | null = null
	private _day: number | null = null
	private _hour: number | null = null
	private _minute: number | null = null
	private _second: number | null = null
	private _offset: number | null = null // in minutes, 0 for Z, null for local
	private _source: string | null = null

	constructor(
		year: number | null = null,
		month: number | null = null,
		day: number | null = null,
		hour: number | null = null,
		minute: number | null = null,
		second: number | null = null,
		offset: number | null = null,
	) {
		this._year = year
		this._month = month
		this._day = day
		this._hour = hour
		this._minute = minute
		this._second = second
		this._offset = offset
	}

	deserialize(value: string): VPropertyTimestampValue {
		// Matches the basic and extended forms, such as 19961022T140000-0500 and 1996-10-22T14:00:00Z
		const [datePart, timePart] = value.split('T', 2)
		const date = parseDate(datePart)
		const time = timePart === undefined ? null : parseTime(timePart)
		const complete = date?.year != null && date.month !== null && date.day !== null
			&& time?.hour != null && time.minute !== null && time.second !== null

		this._year = complete ? date.year : null
		this._month = complete ? date.month : null
		this._day = complete ? date.day : null
		this._hour = complete ? time.hour : null
		this._minute = complete ? time.minute : null
		this._second = complete ? time.second : null
		this._offset = complete ? time.offset : null
		this._source = keepableSource(value)
		return this
	}

	/** Return the text this value was read from, or the standard form once edited. */
	serialize(version: VCardVersion = VCardVersion.V4_0): string {
		if (this._source !== null) return this._source

		const fields = [this._year, this._month, this._day, this._hour, this._minute, this._second]
		if (fields.every(field => field === null)) return ''
		if (fields.some(field => field === null)) {
			throw new Error('Invalid timestamp value: every field except the offset is required')
		}

		const extended = version === VCardVersion.V3_0
		const date = formatDate({ year: this._year, month: this._month, day: this._day }, extended)
		const time = formatTime({ hour: this._hour, minute: this._minute, second: this._second, offset: this._offset }, extended)
		return `${date}T${time}`
	}

	/** Stop writing the original text, so the next serialize uses the standard form. */
	clearSource(): void {
		this._source = null
	}

	type(): string {
		return VParameterValueOptions.TIMESTAMP
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
