import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriDataValue } from './VPropertyUriDataValue'
import { VPropertyUriGeoValue } from './VPropertyUriGeoValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyUriType extends VPropertyBase<VPropertyUriValue|VPropertyUriGeoValue|VPropertyUriDataValue|string> {

	constructor(
	       name: string,
	       value?: string | VPropertyUriValue | VPropertyUriGeoValue | VPropertyUriDataValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			if (value.startsWith('data:')) {
				value = new VPropertyUriDataValue().deserialize(value)
			} else if (value.startsWith('geo:')) {
				value = new VPropertyUriGeoValue().deserialize(value)
			} else {
				value = new VPropertyUriValue().deserialize(value)
			}
		}
		super(name, value, group, params)
	}

}
