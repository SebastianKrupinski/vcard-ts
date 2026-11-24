import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyClientPidMapValue } from './VPropertyClientPidMapValue'

export class VPropertyClientPidMapType extends VPropertyBase<VPropertyClientPidMapValue> {

	constructor(
		name: string,
		value?: string | VPropertyClientPidMapValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	deserialize(value: string): this {
		this._value = new VPropertyClientPidMapValue().deserialize(value)
		return this
	}

}
