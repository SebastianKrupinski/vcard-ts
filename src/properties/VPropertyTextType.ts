import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'
import { decodePropertyValue } from '../codecs/propertyValue'

export class VPropertyTextType extends VPropertyBase<string> {

	constructor(
	       name: string,
	       value?: string,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value === undefined ? undefined : decodePropertyValue(value), group, params)
	}

}
