import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyNameValue } from './VPropertyNameValue'

export class VPropertyNameType extends VPropertyBase<VPropertyNameValue> {

	constructor(
	       name: string,
	       value?: string | VPropertyNameValue,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string): this {
		this._value = new VPropertyNameValue().deserialize(value)
		return this
	}

}
