import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyDateValue } from './VPropertyDateValue'
import { VPropertyTimeValue } from './VPropertyTimeValue'

export class VPropertyDateTimeValue {

	private _date: VPropertyDateValue
	private _time: VPropertyTimeValue

	constructor(date: VPropertyDateValue = new VPropertyDateValue(), time: VPropertyTimeValue = new VPropertyTimeValue()) {
		this._date = date
		this._time = time
	}

	deserialize(value: string): VPropertyDateTimeValue {
		const [datePart, timePart] = value.split('T')
		this._date = new VPropertyDateValue().deserialize(datePart || '')
		this._time = new VPropertyTimeValue().deserialize(timePart || '')
		return this
	}

	serialize(): string {
		return `${this._date.serialize()}T${this._time.serialize()}`
	}

	type(): string {
		return VParameterValueOptions.DATE_TIME
	}

	get date(): VPropertyDateValue {
		return this._date
	}

	set date(value: VPropertyDateValue) {
		this._date = value
	}

	get time(): VPropertyTimeValue {
		return this._time
	}

	set time(value: VPropertyTimeValue) {
		this._time = value
	}

}
