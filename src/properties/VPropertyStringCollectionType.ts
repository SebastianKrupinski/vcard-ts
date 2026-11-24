import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces";
import { decodePropertyValue, splitPropertyValue } from "../codecs/propertyValue";
import { VPropertyBase } from "./VPropertyBase";

export class VPropertyStringCollectionType extends VPropertyBase<string[]> {

	constructor(
		name: string,
		value?: string | string[],
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		super(name, value, group, params)
	}

	/** Application text is one item, so a comma in it is kept rather than splitting it. */
	deserialize(value: string, encoded: boolean = true): this {
		this._value = encoded ? splitPropertyValue(value, ',').map(decodePropertyValue) : [value]
		return this
	}

}
