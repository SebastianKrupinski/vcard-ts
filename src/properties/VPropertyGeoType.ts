import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriGeoValue } from './VPropertyUriGeoValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyGeoType extends VPropertyBase<VPropertyUriGeoValue | VPropertyUriValue> {

	constructor(
		name: string,
		value?: string | VPropertyUriGeoValue | VPropertyUriValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, VParameterValueOptions.URI)
	}

	deserialize(value: string): this {
		this._value = !/^geo:/i.test(value) && /^[a-z][a-z0-9+.-]*:/i.test(value)
			? new VPropertyUriValue().deserialize(value)
			: new VPropertyUriGeoValue().deserialize(value)
		return this
	}

}
