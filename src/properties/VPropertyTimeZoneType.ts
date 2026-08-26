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
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			const valueType = params?.VALUE?.value?.toUpperCase()
			if (valueType === VParameterValueOptions.URI) {
				value = new VPropertyUriValue().deserialize(value)
			} else if (
				valueType === VParameterValueOptions.UTC_OFFSET
				|| (valueType === undefined && /^[+-]\d{2}:\d{2}$/.test(value))
			) {
				value = new VPropertyUtcOffsetValue().deserialize(value)
			} else {
				value = decodePropertyValue(value)
			}
		}
		super(name, value, group, params)
	}

}
