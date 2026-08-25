import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces";
import { decodePropertyValue, splitPropertyValue } from "../codecs/propertyValue";
import { VPropertyBase } from "./VPropertyBase";

export class VPropertyStringCollectionType extends VPropertyBase<string[]> {

	constructor(
		name: string,
		value: string | string[],
		group: string | null = null,
		params: VParameterCollectionInterface = {},
	) {
		if (typeof value === 'string') {
			value = splitPropertyValue(value, ',').map(decodePropertyValue)
		}
		super(name, value, group, params)
	}

}
