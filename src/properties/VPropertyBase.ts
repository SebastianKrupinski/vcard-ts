import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces"
import { VParameterTags, VParameterValueOptions } from "../parameters/VParameterTypes"
import { VPropertyBaseInterface } from "./VPropertyInterfaces"

export class VPropertyBase<T = string> implements VPropertyBaseInterface<T | null> {

	protected _id: string
	protected _name: string
	protected _group: string | null = null
	protected _params: VParameterCollectionInterface
	protected _value: T | null = null

	constructor(
		name: string,
		value?: T,
		group?: string | null,
		params?: VParameterCollectionInterface,
	) {
		this._id = crypto.randomUUID()
		this._name = name
		if (value !== undefined) {
			this._value = value
		}
		if (group !== undefined) {
			this._group = group
		}
		if (params !== undefined) {
			this._params = params
		} else {
			this._params = {}
		}
	}

	get id(): string {
		return this._id
	}

	get name(): string {
		return this._name
	}

	set name(name: string) {
		this._name = name
	}

	get group(): string | null {
		return this._group
	}

	set group(group: string | null) {
		this._group = group
	}

	get hasGroup(): boolean {
		return this._group !== null && this._group !== undefined && this._group.length > 0
	}

	get params(): VParameterCollectionInterface {
		return this._params
	}

	set params(params: VParameterCollectionInterface) {
		this._params = params
	}

	get hasParams(): boolean {
		return Object.keys(this._params).length > 0
	}

	get value(): T | null {
		return this._value
	}

	set value(value: T | null) {
		if (value === undefined) {
			value = null
		}
		if (value !== null) {
			if (typeof value === 'object' && 'type' in value) {
				this._params[VParameterTags.VALUE] = { name: VParameterTags.VALUE, value: (value as any).type() }
			} else {
				this._params[VParameterTags.VALUE] = { name: VParameterTags.VALUE, value: VParameterValueOptions.TEXT }
			}
		} else {
			delete this._params[VParameterTags.VALUE]
		}
		this._value = value
	}

	get hasValue(): boolean {
		return this._value !== null && this._value !== undefined
	}

	get type(): string {
		if (this.params[VParameterTags.VALUE]) {
			return this.params[VParameterTags.VALUE].value.toString()
		}
		return typeof this._value === 'string' ? VParameterValueOptions.TEXT : '';
	}

	set type(value: string) {
		this._params[VParameterTags.VALUE] = { name: VParameterTags.VALUE, value }
	}

}
