import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyGenderValue {

	private _sex: string
	private _identity?: string

	constructor(sex: string = '', identity?: string) {
	       this._sex = sex
	       this._identity = identity
	}

	deserialize(value: string): VPropertyGenderValue {
		const [sex, identity] = value.split(';')
		this._sex = sex || ''
		this._identity = identity || undefined
		return this
	}

	serialize(): string {
		return this._identity ? `${this._sex};${this._identity}` : this._sex
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
