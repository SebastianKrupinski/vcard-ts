import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyNameValue } from './VPropertyNameValue'

export class VPropertyNameType extends VPropertyBase<VPropertyNameValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyNameValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyNameValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
