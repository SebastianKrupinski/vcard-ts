import { decodePropertyValue } from '../codecs/propertyValue'
import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriValue } from './VPropertyUriValue'
import { VPropertyUtcOffsetValue } from './VPropertyUtcOffsetValue'

export class VPropertyTimeZoneType extends VPropertyBase<string | VPropertyUriValue | VPropertyUtcOffsetValue> {

	constructor(
		name: string,
		value?: string | VPropertyUriValue | VPropertyUtcOffsetValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string, encoded: boolean = true): this {
		const valueType = this.params.VALUE?.value?.toUpperCase()
		// An application value that isn't an offset replaces the form, so it can't be lost.
		const isOffset = valueType === VParameterValueOptions.UTC_OFFSET
			? encoded || /^[+-]\d{2}(:?\d{2})?$/.test(value)
			: valueType === undefined && /^[+-]\d{2}:\d{2}$/.test(value)
		if (valueType === VParameterValueOptions.URI) {
			this._value = new VPropertyUriValue().deserialize(value)
		} else if (isOffset) {
			this._value = new VPropertyUtcOffsetValue().deserialize(value)
		} else {
			this._value = encoded ? decodePropertyValue(value) : value
		}
		return this
	}

}
