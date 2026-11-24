import { VParameterValueOptions } from "../parameters/VParameterTypes"
import { decodePropertyValue, encodePropertyValue, splitPropertyValue } from "../codecs/propertyValue"
import { VPropertyValueBase } from "./VPropertyValueBase"

/**
 * A semicolon separated value whose components each hold a comma separated list.
 * Components beyond the known fields are kept so they survive a round trip.
 */
export abstract class VPropertyStructuredValue<Field extends string> extends VPropertyValueBase {

	private _fields: readonly Field[]
	private _components: string[][]
	private _minimumComponents: number

	/** Values are given in field order. */
	constructor(fields: readonly Field[], minimumComponents: number, values: (string | string[] | undefined)[] = []) {
		super()
		this._fields = fields
		this._minimumComponents = minimumComponents
		this._components = []
		values.forEach((value, index) => this.setList(fields[index], value))
	}

	deserialize(value: string): this {
		this._components = splitPropertyValue(value, ';').map(component => component === ''
			? []
			: splitPropertyValue(component, ',').map(decodePropertyValue))
		return this
	}

	serialize(): string {
		const length = Math.max(this._components.length, this._minimumComponents)
		const encoded = Array.from({ length }, (_, index) => (this._components[index] ?? [])
			.map(encodePropertyValue)
			.join(','))
		while (encoded.length > this._minimumComponents && encoded.at(-1) === '') {
			encoded.pop()
		}
		return encoded.join(';')
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}

	/** Every item in a field. Changes to the returned array update this value. */
	getList(field: Field): string[] {
		return this._components[this.fieldIndex(field)] ??= []
	}

	/** Replace every item in a field. Text becomes a single item, and empty text clears the field. */
	setList(field: Field, value?: string | string[] | null): void {
		const items = Array.isArray(value) ? [...value] : value ? [value] : []
		this._components[this.fieldIndex(field)] = items
	}

	private fieldIndex(field: Field): number {
		const index = this._fields.indexOf(field)
		if (index === -1) {
			throw new Error(`Unknown structured value field: ${field}`)
		}
		return index
	}

}
