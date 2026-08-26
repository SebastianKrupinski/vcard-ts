import { VParameterValueOptions } from '../parameters/VParameterTypes'

export class VPropertyBinaryValue {

	private _data: string

	constructor(data = '') {
		this._data = data
	}

	deserialize(value: string): VPropertyBinaryValue {
		this._data = value
		return this
	}

	serialize(): string {
		return this._data
	}

	type(): string {
		return VParameterValueOptions.BINARY
	}

	get data(): string {
		return this._data
	}

	set data(value: string) {
		this._data = value
	}

}
