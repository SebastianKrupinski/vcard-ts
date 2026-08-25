import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { decodePropertyValue, splitPropertyValue } from "../codecs/propertyValue"

export class VPropertyOrganizationValue {

	private _name: string
	private _unit: string | null

	constructor(name: string = '', unit: string | null = null) {
		this._name = name
		this._unit = unit
	}

	deserialize(value: string): VPropertyOrganizationValue {
		const parts = splitPropertyValue(value, ';').map(decodePropertyValue)
		this._name = parts[0] || ''
		this._unit = parts[1] || null
		return this
	}

	serialize(): string {
		return `${this._name};${this._unit}`
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

	get unit(): string | null {
		return this._unit
	}

	set unit(value: string | null) {
		this._unit = value
	}

}
