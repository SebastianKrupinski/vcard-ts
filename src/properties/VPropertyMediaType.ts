import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterEncodingOptions, VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyBinaryValue } from './VPropertyBinaryValue'
import { VPropertyUriDataValue } from './VPropertyUriDataValue'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyMediaType extends VPropertyBase<VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue> {

	constructor(
		name: string,
		value?: string | VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, VParameterValueOptions.URI)
	}

	deserialize(value: string): this {
		const encoding = this.params.ENCODING?.value?.toUpperCase()
		const valueType = this.params.VALUE?.value?.toUpperCase()
		if (encoding === VParameterEncodingOptions.B || valueType === VParameterValueOptions.BINARY) {
			this._value = new VPropertyBinaryValue().deserialize(value)
		} else {
			this._value = /^data:/i.test(value)
				? new VPropertyUriDataValue().deserialize(value)
				: new VPropertyUriValue().deserialize(value)
		}
		return this
	}

	get value(): VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue | null {
		return super.value
	}

	set value(value: string | VPropertyBinaryValue | VPropertyUriDataValue | VPropertyUriValue | null) {
		// Refresh before assignment because callers can change ENCODING directly.
		this._defaultValueType = this.params.ENCODING?.value?.toUpperCase() === VParameterEncodingOptions.B
			? [VParameterValueOptions.URI, VParameterValueOptions.BINARY]
			: VParameterValueOptions.URI
		super.value = value
	}

}
