import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { decodePropertyValue, encodePropertyValue, splitPropertyValue } from "../codecs/propertyValue"

export class VPropertyOrganizationValue {

	private _name: string
	private _units: string[]

	constructor(name: string = '', units: string[] = []) {
		this._name = name
		this._units = units
	}

	deserialize(value: string): VPropertyOrganizationValue {
		const [name = '', ...units] = splitPropertyValue(value, ';').map(decodePropertyValue)
		this._name = name
		this._units = units
		return this
	}

	serialize(): string {
		return [this._name, ...this._units]
			.map(encodePropertyValue)
			.join(';')
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}
	
	get name(): string {
		return this._name
	}

	set name(value: string) {
		this._name = value
	}

	get units(): string[] {
		return this._units
	}

	set units(value: string[]) {
		this._units = value
	}

}
