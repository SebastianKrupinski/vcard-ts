import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyOrganizationValue } from './VPropertyOrganizationValue'

export class VPropertyOrganizationType extends VPropertyBase<VPropertyOrganizationValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyOrganizationValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyOrganizationValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
