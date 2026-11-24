import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyDateTimeValue } from './VPropertyDateTimeValue'
import { VPropertyDateValue } from './VPropertyDateValue'
import { VPropertyTimestampValue } from './VPropertyTimestampValue'
import { VPropertyTimeValue } from './VPropertyTimeValue'
import { decodePropertyValue } from '../codecs/propertyValue'

export class VPropertyTemporalType extends VPropertyBase<VPropertyDateValue|VPropertyTimeValue|VPropertyDateTimeValue|VPropertyTimestampValue|string> {

	constructor(
	       name: string,
	       value?: string | VPropertyDateValue | VPropertyTimeValue | VPropertyDateTimeValue | VPropertyTimestampValue,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, [
			VParameterValueOptions.DATE,
			VParameterValueOptions.TIME,
			VParameterValueOptions.DATE_TIME,
			VParameterValueOptions.TIMESTAMP,
		])
	}

	deserialize(value: string, encoded: boolean = true): this {
		const valueType = this.params.VALUE?.value?.toUpperCase()
		const name = this.name.toUpperCase()
		if (valueType === VParameterValueOptions.TEXT) {
			this._value = encoded ? decodePropertyValue(value) : value
		} else if (valueType === VParameterValueOptions.TIMESTAMP) {
			this._value = new VPropertyTimestampValue().deserialize(value)
		} else if (valueType === VParameterValueOptions.DATE_TIME) {
			this._value = new VPropertyDateTimeValue().deserialize(value)
		} else if (valueType === VParameterValueOptions.DATE) {
			this._value = new VPropertyDateValue().deserialize(value)
		} else if (valueType === VParameterValueOptions.TIME) {
			this._value = new VPropertyTimeValue().deserialize(value)
		} else if ((name === 'REV' || name === 'CREATED') && value.includes('T')) {
			this._value = new VPropertyTimestampValue().deserialize(value)
		} else if (value.startsWith('T')) {
			this._value = new VPropertyTimeValue().deserialize(value)
		} else if (value.includes('T')) {
			this._value = new VPropertyDateTimeValue().deserialize(value)
		} else {
			this._value = new VPropertyDateValue().deserialize(value)
		}
		return this
	}

}
