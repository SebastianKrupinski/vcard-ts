import { decodeParameters, encodeParameters } from './parameter'
import { decodePropertyValue, encodePropertyValue } from './propertyValue'
import { VPropertyBase } from '../properties/VPropertyBase'
import { VPropertyTimeValue } from '../properties/VPropertyTimeValue'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import type { VPropertyBaseInterface } from '../properties/VPropertyInterfaces'
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
	if (!name) {
		return new VPropertyBase('', decodePropertyValue(rawValue), group, params)
	}
	const PropertyType = propertyTypes[name.toUpperCase()]
	if (PropertyType === VPropertyBase) {
		return new VPropertyBase(name, decodePropertyValue(rawValue), group, params)
	}
	if (PropertyType) {
		return new PropertyType(name, rawValue, group, params)
	}
	return new VPropertyBase(name, decodePropertyValue(rawValue), group, params)
}

export function encodeProperty(
	property: VPropertyBaseInterface<unknown>,
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

function encodeTypedPropertyValue(property: VPropertyBaseInterface<unknown>, version: VCardVersion): string {
	const value = property.value
	if (value === null || value === undefined) return ''
	if (typeof value === 'string') return encodePropertyValue(value)
	if (Array.isArray(value)) {
		return value.map(item => encodePropertyValue(String(item))).join(',')
	}
	if (value instanceof VPropertyTimeValue) {
		// Without VALUE=time, a time needs its T to be told apart from a date.
		const text = value.serialize(version)
		const declaredAsTime = property.params.VALUE?.value.toUpperCase() === VParameterValueOptions.TIME
		return declaredAsTime || text === '' || text.startsWith('T') ? text : `T${text}`
	}
	if (typeof value === 'object' && 'serialize' in value
		&& typeof value.serialize === 'function') {
		return value.serialize(version)
	}
	return String(value)
}

/**
 *
 * @param data
 */
function extractPropertyHeader(data: string): { name: string; group: string | null; remaining: string } {

	const header = data.match(/^(.*?)[\:;]/)?.[1]
	if (!header) {
		throw new Error('Invalid card property line: ' + data)
	}
	const remaining = data.slice(header.length) // +1 to skip the ':' or ';'
	let propertyName: string | null = null
	let propertyGroup: string | null = null
	if (header.indexOf('.') >= 1) {
		[propertyGroup, propertyName] = header.split('.', 2)
	} else {
		propertyName = header
		propertyGroup = null
	}

	return { name: propertyName, group: propertyGroup, remaining }
}
