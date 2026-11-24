import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyOrganizationValue } from './VPropertyOrganizationValue'

export class VPropertyOrganizationType extends VPropertyBase<VPropertyOrganizationValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyOrganizationValue,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string): this {
		this._value = new VPropertyOrganizationValue().deserialize(value)
		return this
	}

}
