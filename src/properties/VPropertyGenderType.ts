import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyGenderValue } from './VPropertyGenderValue'

export class VPropertyGenderType extends VPropertyBase<VPropertyGenderValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyGenderValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyGenderValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
