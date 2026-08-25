import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { decodePropertyValue, encodePropertyValue, splitPropertyValue } from "../codecs/propertyValue"

export class VPropertyGenderValue {

	private _sex: string
	private _identity?: string

	constructor(sex: string = '', identity?: string) {
	       this._sex = sex
	       this._identity = identity
	}

	deserialize(value: string): VPropertyGenderValue {
		const [sex, identity] = splitPropertyValue(value, ';').map(decodePropertyValue)
		this._sex = sex || ''
		this._identity = identity || undefined
		return this
	}

	serialize(): string {
		const sex = encodePropertyValue(this._sex)
		return this._identity
			? `${sex};${encodePropertyValue(this._identity)}`
			: sex
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}
	
	get sex(): string {
	       return this._sex
	}

	set sex(value: string) {
	       this._sex = value
	}

	get identity(): string | undefined {
	       return this._identity
	}

	set identity(value: string | undefined) {
	       this._identity = value
	}

}
