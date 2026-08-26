import { VParameterValueOptions } from '../parameters/VParameterTypes'

export class VPropertyUtcOffsetValue {

	private _offset: number | null = null
	private _extended = false

	constructor(offset: number | null = null, extended = false) {
		this.offset = offset
		this._extended = extended
	}

	deserialize(value: string): VPropertyUtcOffsetValue {
		const match = value.match(/^([+-])(\d{2})(:?)(\d{2})$/)
		if (!match) {
			this._offset = null
			this._extended = false
			return this
		}

		const hours = Number(match[2])
		const minutes = Number(match[4])
		if (hours > 23 || minutes > 59) {
			this._offset = null
			this._extended = false
			return this
		}

		const sign = match[1] === '+' ? 1 : -1
		this._offset = sign * (hours * 60 + minutes)
		this._extended = match[3] === ':'
		return this
	}

	serialize(): string {
		if (this._offset === null) return ''

		const sign = this._offset >= 0 ? '+' : '-'
		const absoluteOffset = Math.abs(this._offset)
		const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0')
		const minutes = String(absoluteOffset % 60).padStart(2, '0')
		return `${sign}${hours}${this._extended ? ':' : ''}${minutes}`
	}

	type(): string {
		return VParameterValueOptions.UTC_OFFSET
	}

	get offset(): number | null {
		return this._offset
	}

	set offset(value: number | null) {
		this._offset = value !== null && Number.isInteger(value) && Math.abs(value) < 24 * 60
			? value
			: null
	}

	get extended(): boolean {
		return this._extended
	}

	set extended(value: boolean) {
		this._extended = value
	}

}
