import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyGenderValue } from './VPropertyGenderValue'

export class VPropertyGenderType extends VPropertyBase<VPropertyGenderValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyGenderValue,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string): this {
		this._value = new VPropertyGenderValue().deserialize(value)
		return this
	}

}
