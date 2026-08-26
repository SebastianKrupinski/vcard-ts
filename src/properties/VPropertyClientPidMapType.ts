import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyClientPidMapValue } from './VPropertyClientPidMapValue'

export class VPropertyClientPidMapType extends VPropertyBase<VPropertyClientPidMapValue> {

	constructor(
		name: string,
		value?: string | VPropertyClientPidMapValue,
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			value = new VPropertyClientPidMapValue().deserialize(value)
		}
		super(name, value, group, params)
	}

}
