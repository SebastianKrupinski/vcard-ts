import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyAddressValue } from './VPropertyAddressValue'
import { VPropertyBase } from './VPropertyBase'

export class VPropertyAddressType extends VPropertyBase<VPropertyAddressValue> {

	constructor(
		name: string,
		value?: string | VPropertyAddressValue,
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyAddressValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
