import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VPropertyBase } from './VPropertyBase'

export class VPropertyTextType extends VPropertyBase<string> {

	constructor(
	       name: string,
	       value?: string,
	       group?: string | null,
	       params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

}
