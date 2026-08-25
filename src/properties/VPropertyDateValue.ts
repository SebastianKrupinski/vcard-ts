import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyDateValue {

	private _year: number | null
	private _month: number | null
	private _day: number | null

	constructor(year?: number | null, month?: number | null, day?: number | null) {
	       this._year = year ?? null
	       this._month = month ?? null
	       this._day = day ?? null
	}

	deserialize(value: string): VPropertyDateValue {
		// possible formats: 19850412, 1985-04, 1985, --0412, ---12
		const dayOnly = value.match(/^---(\d{2})$/)
		if (dayOnly) {
			this._year = null
			this._month = null
			this._day = parseInt(dayOnly[1])
			return this
		}

		const regex = /^(\d{4}|--)?-?(\d{2})?-?(\d{2})?$/
		const match = value.match(regex)
		if (match) {
			this._year = match[1] && match[1] !== '--' ? parseInt(match[1]) : null
			this._month = match[2] ? parseInt(match[2]) : null
			this._day = match[3] ? parseInt(match[3]) : null
		} else {
			this._year = null
			this._month = null
			this._day = null
		}
		return this
	}

	serialize(): string {
		return [
			this._year !== null ? String(this._year).padStart(4, '0') : '',
			this._month !== null ? String(this._month).padStart(2, '0') : '',
			this._day !== null ? String(this._day).padStart(2, '0') : '',
		].join('-')
	}

	type(): string {
		return VParameterValueOptions.DATE
	}

	get year(): number | null {
	       return this._year
	}

	set year(value: number | null) {
	       this._year = value
	}

	get month(): number | null {
	       return this._month
	}

	set month(value: number | null) {
	       this._month = value
	}

	get day(): number | null {
	       return this._day
	}

	set day(value: number | null) {
	       this._day = value
	}

}
