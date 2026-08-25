import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyTimestampValue {

	private _year: number | null = null
	private _month: number | null = null
	private _day: number | null = null
	private _hour: number | null = null
	private _minute: number | null = null
	private _second: number | null = null
	private _offset: number | null = null // in minutes, 0 for Z, null for local

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
		// Matches: 19961022T140000, 19961022T140000Z, 19961022T140000-05, 19961022T140000-0500
		const regex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z|([+-])(\d{2})(\d{2})?)?$/
		const match = value.match(regex)
		if (match) {
			this._year = parseInt(match[1])
			this._month = parseInt(match[2])
			this._day = parseInt(match[3])
			this._hour = parseInt(match[4])
			this._minute = parseInt(match[5])
			this._second = parseInt(match[6])
			if (match[7] === 'Z') {
				this._offset = 0
			} else if (match[7]) {
				const sign = match[8] === '+' ? 1 : -1
				const hours = parseInt(match[9])
				const minutes = match[10] ? parseInt(match[10]) : 0
				this._offset = sign * (hours * 60 + minutes)
			} else {
				this._offset = null
			}
		} else {
			this._year = null
			this._month = null
			this._day = null
			this._hour = null
			this._minute = null
			this._second = null
			this._offset = null
		}
		return this
	}

	serialize(): string {
		if (
			this._year === null
			|| this._month === null
			|| this._day === null
			|| this._hour === null
			|| this._minute === null
			|| this._second === null
		) {
			return ''
		}
		const date = String(this._year).padStart(4, '0')
			+ String(this._month).padStart(2, '0')
			+ String(this._day).padStart(2, '0')
		const time
			= 'T'
			+ String(this._hour).padStart(2, '0')
			+ String(this._minute).padStart(2, '0')
			+ String(this._second).padStart(2, '0')
		let offsetStr = ''
		if (this._offset === 0) {
			offsetStr = 'Z'
		} else if (this._offset !== null) {
			const sign = this._offset >= 0 ? '+' : '-'
			const abs = Math.abs(this._offset)
			const hours = Math.floor(abs / 60)
			const minutes = abs % 60
			if (minutes === 0) {
				offsetStr = `${sign}${String(hours).padStart(2, '0')}`
			} else {
				offsetStr = `${sign}${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`
			}
		}
		return date + time + offsetStr
	}

	type(): string {
		return VParameterValueOptions.TIMESTAMP
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

	get hour(): number | null {
		return this._hour
	}

	set hour(value: number | null) {
		this._hour = value
	}

	get minute(): number | null {
		return this._minute
	}

	set minute(value: number | null) {
		this._minute = value
	}

	get second(): number | null {
		return this._second
	}

	set second(value: number | null) {
		this._second = value
	}

	get offset(): number | null {
		return this._offset
	}

	set offset(value: number | null) {
		this._offset = value
	}

}
