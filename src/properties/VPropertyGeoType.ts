import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriGeoValue } from './VPropertyUriGeoValue'

export class VPropertyGeoType extends VPropertyBase<VPropertyUriGeoValue> {

	constructor(
		name: string,
		value?: string | VPropertyUriGeoValue,
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyUriGeoValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
