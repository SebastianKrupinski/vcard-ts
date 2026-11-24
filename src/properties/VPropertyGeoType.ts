import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriGeoValue } from './VPropertyUriGeoValue'

export class VPropertyGeoType extends VPropertyBase<VPropertyUriGeoValue> {

	constructor(
		name: string,
		value?: string | VPropertyUriGeoValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, VParameterValueOptions.URI)
	}

	deserialize(value: string): this {
		this._value = new VPropertyUriGeoValue().deserialize(value)
		return this
	}

}
