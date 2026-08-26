import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriDataValue } from './VPropertyUriDataValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyUriType extends VPropertyBase<VPropertyUriValue|VPropertyUriDataValue|string> {

	constructor(
	       name: string,
	       value?: string | VPropertyUriValue | VPropertyUriDataValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			if (value.startsWith('data:')) {
				value = new VPropertyUriDataValue().deserialize(value)
			} else {
				value = new VPropertyUriValue().deserialize(value)
			}
		}
		super(name, value, group, params)
	}

}
