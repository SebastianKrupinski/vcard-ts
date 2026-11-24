import { VCardVersion } from '../VCardInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyDateValue } from './VPropertyDateValue'
import { VPropertyTimeValue } from './VPropertyTimeValue'
import { VPropertyValueBase } from './VPropertyValueBase'

export class VPropertyDateTimeValue extends VPropertyValueBase {

	private _date: VPropertyDateValue
	private _time: VPropertyTimeValue

	constructor(date: VPropertyDateValue = new VPropertyDateValue(), time: VPropertyTimeValue = new VPropertyTimeValue()) {
		super()
		this._date = date
		this._time = time
	}

	deserialize(value: string): VPropertyDateTimeValue {
		// Split on the first T only, so the two parts always rejoin to the original text.
		const separator = value.indexOf('T')
		const datePart = separator === -1 ? value : value.slice(0, separator)
		const timePart = separator === -1 ? '' : value.slice(separator + 1)
		this._date = new VPropertyDateValue().deserialize(datePart)
		this._time = new VPropertyTimeValue().deserialize(timePart)
		if (separator === -1) this._time.clearSource()
		return this
	}

	/** Each part keeps its own original text until that part is edited. */
	serialize(version: VCardVersion = VCardVersion.V4_0): string {
		const date = this._date.serialize(version)
		const time = this._time.serialize(version)
		return time !== '' || this._time.source !== null ? `${date}T${time}` : date
	}

	/** Stop writing the original text, so the next serialize uses the standard form. */
	clearSource(): void {
		this._date.clearSource()
		this._time.clearSource()
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
