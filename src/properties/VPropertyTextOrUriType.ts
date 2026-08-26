import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyUriOrTextType } from './VPropertyUriOrTextType'
import { VPropertyUriValue } from './VPropertyUriValue'

export class VPropertyTextOrUriType extends VPropertyUriOrTextType {

	constructor(
		name: string,
		value?: string | VPropertyUriValue,
		group?: string,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params, VParameterValueOptions.TEXT)
	}

}
