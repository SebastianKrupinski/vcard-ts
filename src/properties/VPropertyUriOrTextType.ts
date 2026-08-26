import { decodePropertyValue } from '../codecs/propertyValue'
import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyUriOrTextType extends VPropertyBase<VPropertyUriValue | string> {

	constructor(
		name: string,
		value?: string | VPropertyUriValue,
		group?: string,
		params?: VParameterCollectionInterface,
		defaultType: string = VParameterValueOptions.URI,
	) {
		if (typeof value === 'string') {
			const valueType = params?.VALUE?.value?.toUpperCase() ?? defaultType
			value = valueType === VParameterValueOptions.TEXT
				? decodePropertyValue(value)
				: new VPropertyUriValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
