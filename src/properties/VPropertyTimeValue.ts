import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyTimeValue {

	private _hour: number | null = null
	private _minute: number | null = null
	private _second: number | null = null
	private _offset: number | null = null // in minutes, 0 for Z, null for local

	constructor(hour: number | null = null, minute: number | null = null, second: number | null = null, offset: number | null = null) {
		this._hour = hour
		this._minute = minute
		this._second = second
		this._offset = offset
	}

	deserialize(value: string): VPropertyTimeValue {
		// possible formats: 102200, 1022, 10, -2200, --00, 102200Z, 102200-0800
		const regex = /^(\d{2})?(\d{2})?(\d{2})?(Z|([+-]\d{4}))?$/
		const match = value.match(regex)
		if (match) {
			this._hour = match[1] ? parseInt(match[1]) : null
			this._minute = match[2] ? parseInt(match[2]) : null
			this._second = match[3] ? parseInt(match[3]) : null
			if (match[4] === 'Z') {
				this._offset = 0
			} else if (match[5]) {
				const sign = match[5][0] === '+' ? 1 : -1
				const hours = parseInt(match[5].substring(1, 3))
				const minutes = parseInt(match[5].substring(3, 5))
				this._offset = sign * (hours * 60 + minutes)
			} else {
				this._offset = null
			}
		} else {
			this._hour = null
			this._minute = null
			this._second = null
			this._offset = null
		}
		return this
	}

	serialize(): string {
		const hour = this._hour !== null ? String(this._hour).padStart(2, '0') : '--'
		const minute = this._minute !== null ? String(this._minute).padStart(2, '0') : '--'
		const second = this._second !== null ? String(this._second).padStart(2, '0') : '--'
		const offset = this._offset !== null ? (this._offset === 0 ? 'Z' : (this._offset > 0 ? '+' : '-') + String(Math.abs(this._offset)).padStart(4, '0')) : null
		return `${hour}${minute}${second}${offset || ''}`
	}

	type(): string {
		return VParameterValueOptions.TIME
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
