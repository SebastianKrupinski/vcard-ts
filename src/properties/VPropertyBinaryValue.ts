import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyValueBase } from './VPropertyValueBase'

export class VPropertyBinaryValue extends VPropertyValueBase {

	private _data: string

	constructor(data = '') {
		super()
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
