import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterEncodingOptions, VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyBinaryValue } from './VPropertyBinaryValue'
import { VPropertyUriDataValue } from './VPropertyUriDataValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyMediaType extends VPropertyBase<VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue> {

	constructor(
		name: string,
		value?: string | VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue,
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			const encoding = params?.ENCODING?.value?.toUpperCase()
			const valueType = params?.VALUE?.value?.toUpperCase()
			if (encoding === VParameterEncodingOptions.B || valueType === VParameterValueOptions.BINARY) {
				value = new VPropertyBinaryValue().deserialize(value)
			} else if (/^data:/i.test(value)) {
				value = new VPropertyUriDataValue().deserialize(value)
			} else {
				value = new VPropertyUriValue().deserialize(value)
			}
		}
		super(name, value, group, params)
	}

}
