import { decodePropertyValue } from '../codecs/propertyValue'
import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyUriOrTextType extends VPropertyBase<VPropertyUriValue | string> {

	constructor(
		name: string,
		value?: string | VPropertyUriValue,
		group?: string | null,
		params?: VParameterCollectionInterface,
		defaultValueType: string = VParameterValueOptions.URI,
	) {
		super(name, value, group, params, defaultValueType)
	}

	deserialize(value: string, encoded: boolean = true): this {
		const declared = this.params.VALUE?.value?.toUpperCase()
		const isUri = declared ? declared === VParameterValueOptions.URI : this._defaultValueType === VParameterValueOptions.URI
		this._value = isUri
			? new VPropertyUriValue().deserialize(value)
			: encoded ? decodePropertyValue(value) : value
		return this
	}

}
