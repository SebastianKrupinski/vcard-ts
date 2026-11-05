import { parameterSources } from "./internal/parameterSources"
import { VParameterListInterface, VParameterObjectInterface } from "./VParameterInterfaces"

export class VParameterObject implements VParameterObjectInterface {

	name: string
	protected _value: string

	constructor(name: string = '', value: string = '') {
		this.name = name
		this._value = value
	}

	/** The parameter's value. For a list parameter, every value joined with commas. */
	get value(): string {
		return this._value
	}

	set value(value: string) {
		this._value = value
		parameterSources.delete(this)
	}

	/** Each occurrence's text as it was read, or null if created or edited in code. */
	get source(): readonly string[] | null {
		const source = parameterSources.get(this)
		return source === undefined ? null : [...source]
	}

}

/** A parameter defined as a comma-separated list: TYPE, PID, or SORT-AS. */
export class VParameterListObject extends VParameterObject implements VParameterListInterface {

	private _items: string[]

	constructor(name: string = '', value: string | readonly string[] = '') {
		super(name)
		this._items = typeof value === 'string' ? splitValue(value) : [...value]
	}

	/** Every list item joined with commas, for compatibility with scalar parameters. */
	override get value(): string {
		return this._items.join(',')
	}

	override set value(value: string) {
		this.list = splitValue(value)
	}

	/** Individual values, preserving commas inside an item. */
	get list(): readonly string[] {
		return [...this._items]
	}

	set list(values: readonly string[]) {
		this._items = [...values]
		parameterSources.delete(this)
	}

}

function splitValue(value: string): string[] {
	return value === '' ? [] : value.split(',')
}

export function createParameter(name: string, value = ''): VParameterObject {
	return ['TYPE', 'PID', 'SORT-AS'].includes(name.toUpperCase())
		? new VParameterListObject(name, value)
		: new VParameterObject(name, value)
}

export class VParameterCollection {

	[key: string]: VParameterObjectInterface

	constructor(params: Array<{ name: string, value: string }> = []) {
		for (const param of params) {
			this[param.name] = createParameter(param.name, param.value)
		}
	}

}
