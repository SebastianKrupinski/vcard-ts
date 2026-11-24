import { decodePropertyValue } from "../codecs/propertyValue"
import { VParameterCollectionInterface } from "../parameters/VParameterInterfaces"
import { VParameterTags, VParameterValueOptions } from "../parameters/VParameterTypes"
import { VPropertyBaseInterface } from "./VPropertyInterfaces"
import { VPropertyValueBase } from "./VPropertyValueBase"

export class VPropertyBase<T = string | string[] | VPropertyValueBase> implements VPropertyBaseInterface<T> {

	protected _id: string
	protected _name: string
	protected _group: string | null = null
	protected _params: VParameterCollectionInterface
	protected _value: T | null = null
	protected _defaultValueType: string | readonly string[] = VParameterValueOptions.TEXT

	constructor(name: string, value?: T, group?: string | null, params?: VParameterCollectionInterface, defaultValueType?: string | readonly string[])
	constructor(name: string, value: T | string | undefined, group?: string | null, params?: VParameterCollectionInterface, defaultValueType?: string | readonly string[])
	constructor(
		name: string,
		value?: T | string,
		group?: string | null,
		params?: VParameterCollectionInterface,
		defaultValueType: string | readonly string[] = VParameterValueOptions.TEXT,
	) {
		this._id = crypto.randomUUID()
		this._name = name
		this._defaultValueType = defaultValueType
		if (group !== undefined) {
			this._group = group
		}
		if (params !== undefined) {
			this._params = params
		} else {
			this._params = {}
		}
		if (value !== undefined) {
			this.value = value
		}
	}

	/**
	 * Read a vCard value without changing its parameters. Constructors and value
	 * assignments pass encoded=false to preserve literal application text.
	 */
	deserialize(value: string, encoded: boolean = true): this {
		const isUri = this.params.VALUE?.value.toUpperCase() === VParameterValueOptions.URI
		this._value = (encoded && !isUri ? decodePropertyValue(value) : value) as T
		return this
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

	/** Text is converted the same way as in the constructor. */
	set value(value: T | string | null) {
		if (value === undefined || value === null) {
			delete this._params[VParameterTags.VALUE]
			this._value = null
			return
		}
		if (typeof value === 'string') {
			this.deserialize(value, false)
		} else {
			this._value = value
		}
		const type = this.valueType()
		const declared = this._params[VParameterTags.VALUE]?.value.toString()
		if (declared?.toUpperCase() === type.toUpperCase()) return
		const defaults = this._defaultValueType
		if (typeof defaults === 'string' ? type === defaults : defaults.includes(type)) {
			delete this._params[VParameterTags.VALUE]
		} else {
			this._params[VParameterTags.VALUE] = { name: VParameterTags.VALUE, value: type }
		}
	}

	private valueType(): string {
		if (this._value instanceof VPropertyValueBase) return this._value.type()
		if (typeof this._value === 'string' && this.params.VALUE?.value.toUpperCase() === VParameterValueOptions.URI) {
			return VParameterValueOptions.URI
		}
		return VParameterValueOptions.TEXT
	}

	get hasValue(): boolean {
		return this._value !== null && this._value !== undefined
	}

	get type(): string {
		if (this.params[VParameterTags.VALUE]) {
			return this.params[VParameterTags.VALUE].value.toString()
		}
		return this.hasValue ? this.valueType() : ''
	}

	set type(value: string) {
		this._params[VParameterTags.VALUE] = { name: VParameterTags.VALUE, value }
	}

}
