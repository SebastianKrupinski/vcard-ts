import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriDataValue } from './VPropertyUriDataValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyUriType extends VPropertyBase<VPropertyUriValue|VPropertyUriDataValue|string> {

	constructor(
	       name: string,
	       value?: string | VPropertyUriValue | VPropertyUriDataValue,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, VParameterValueOptions.URI)
	}

	deserialize(value: string): this {
		this._value = value.startsWith('data:')
			? new VPropertyUriDataValue().deserialize(value)
			: new VPropertyUriValue().deserialize(value)
		return this
	}

}
