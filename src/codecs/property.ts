import { decodeParameters, encodeParameters } from './parameter'
import { encodePropertyValue } from './propertyValue'
import { VPropertyBase } from '../properties/VPropertyBase'
import { VPropertyTimeValue } from '../properties/VPropertyTimeValue'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import type { VPropertyBaseInterface } from '../properties/VPropertyInterfaces'
import { VPropertyValueBase } from '../properties/VPropertyValueBase'
import { VCardVersion } from '../VCardInterfaces'
import { propertyTypes } from '../properties/VPropertyTypes'

/** Decode an unfolded property line, including its group, parameters, and typed value. */
export function decodeProperty(data: string): VPropertyBase | null {
	let name: string | null = null
	let group: string | null = null
	let remaining: string
	// Extract the property name and group, then consume its parameter section.
	({ name, group, remaining } = extractPropertyHeader(data))
	const { params, remaining: valueSource } = decodeParameters(remaining)
	// The codec leaves the colon before the property value.
	const rawValue = valueSource.slice(1)
	// instantiate the property object
	const PropertyType = propertyTypes[(name ?? '').toUpperCase()] ?? VPropertyBase
	return new PropertyType(name ?? '', undefined, group, params).deserialize(rawValue)
}

export function encodeProperty(
	property: VPropertyBaseInterface,
	version: VCardVersion = VCardVersion.V4_0,
): string {
	const group = property.hasGroup ? `${property.group}.` : ''
	const parameters = encodeParameters(property.params)
	const header = `${group}${property.name}${parameters ? `;${parameters}` : ''}`

	const line = `${header}:${encodeTypedPropertyValue(property, version)}`
	if (/[\r\n]/.test(line)) {
		throw new Error('Invalid property line: unescaped line break')
	}
	return line
}

function encodeTypedPropertyValue(property: VPropertyBaseInterface, version: VCardVersion): string {
	const value = property.value
	if (value === null || value === undefined) return ''
	if (typeof value === 'string') {
		const isUri = property.params.VALUE?.value.toUpperCase() === VParameterValueOptions.URI
		return isUri ? value : encodePropertyValue(value)
	}
	if (Array.isArray(value)) {
		return value.map(item => encodePropertyValue(item)).join(',')
	}
	if (value instanceof VPropertyTimeValue) {
		// Without VALUE=time, a time needs its T to be told apart from a date.
		const text = value.serialize(version)
		const declaredAsTime = property.params.VALUE?.value.toUpperCase() === VParameterValueOptions.TIME
		return declaredAsTime || text === '' || text.startsWith('T') ? text : `T${text}`
	}
	if (value instanceof VPropertyValueBase) {
		return value.serialize(version)
	}
	throw new Error(`Invalid property value: ${property.name} must be text, a list, or a VPropertyValueBase`)
}

/** Read an optional group and property name without discarding header text. */
function extractPropertyHeader(data: string): { name: string; group: string | null; remaining: string } {
	const header = data.match(/^(?:([a-z0-9-]+)\.)?([a-z0-9-]+)(?=[:;])/i)
	if (!header) {
		throw new Error('Invalid card property line: ' + data)
	}
	return {
		name: header[2],
		group: header[1] ?? null,
		remaining: data.slice(header[0].length),
	}
}
