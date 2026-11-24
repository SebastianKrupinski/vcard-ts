import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyAddressValue } from './VPropertyAddressValue'
import { VPropertyBase } from './VPropertyBase'

export class VPropertyAddressType extends VPropertyBase<VPropertyAddressValue> {

	constructor(
		name: string,
		value?: string | VPropertyAddressValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string): this {
		this._value = new VPropertyAddressValue().deserialize(value)
		return this
	}

}
