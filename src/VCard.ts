import { VParameterCollection, VParameterObject } from './parameters/VParameterObject'
import { decodeParameterValue, encodeParameters } from './codecs/parameterValue'
import { decodePropertyValue, encodePropertyValue } from './codecs/propertyValue'
import { foldContentLine, normalizeNewlines, unfoldContentLines } from './codecs/contentLine'
import { VPropertyBase } from './properties/VPropertyBase'
import type { VPropertyBaseInterface } from './properties/VPropertyInterfaces'
import { VCardInterface, VCardPropertyVersionValues } from './VCardInterfaces'
import { VCard } from './VCardObjects'
import { knownProperties } from './properties/VPropertyTypes'
import { VPropertyCollection } from './properties/VPropertyCollection'

/**
 *
 * @param data
 */
export function deserialize(data: string): VCard[] {

	// sanity check - for minimal vCard length
	// (BEGIN:VCARD\nVERSION:4.0\nFN:a\nEND:VCARD)
	if (data.length < 30) {
		throw new Error('Invalid input data: length too short')
	}
	// extract all VCARD blocks
	// we use [\s\S] to match all characters including newlines
	// the non-greedy *? ensures we match individual cards
	const dataBlocks: string[] | null = data.match(/^BEGIN:VCARD[\s\S]*?^END:VCARD/gmiu)
	// sanity check - must have at least one card
	if (!dataBlocks) {
		throw new Error('Invalid input data: no cards found')
	}
	const cardCollection: VCard[] = []
	// parse each card
	dataBlocks.forEach((dataBlock, index) => {
		const vCard = deserializeCard(dataBlock)
		cardCollection.push(vCard)
	})
	return cardCollection
}

/**
 * Parse a single vCard string into a simple object model.
 * Throws if the payload is invalid or not a single VCARD.
 * @param data
 */
export function deserializeCard(data: string): VCard {
	data = data.trim()
	const boundaryLines = normalizeNewlines(data).split('\n')
	// sanity check - for start tag and end tag
	if (boundaryLines[0]?.toUpperCase() !== 'BEGIN:VCARD') {
		throw new Error('Invalid vCard data: missing BEGIN:VCARD')
	}
	if (boundaryLines.at(-1)?.toUpperCase() !== 'END:VCARD') {
		throw new Error('Invalid vCard data: missing END:VCARD')
	}

	const lines = unfoldContentLines(data)
	const properties = new VPropertyCollection()

	for (const [index, rawLine] of lines.entries()) {
		const line = rawLine.trimEnd()
		if (line.length === 0) continue
		if (index === 0 || index === lines.length - 1) continue
		if (/^(BEGIN|END):VCARD$/i.test(line)) {
			throw new Error('Invalid vCard data: nested card marker')
		}

		const prop = deserializeProperty(line)
		if (!prop) continue

		properties.push(prop)
	}

	const versionProperties = properties.filter(property => property.name.toUpperCase() === 'VERSION')
	if (versionProperties.length !== 1) {
		throw new Error(`Invalid vCard data: expected exactly one VERSION property, found ${versionProperties.length}`)
	}

	const versionValue = versionProperties[0].value
	if (typeof versionValue !== 'string'
		|| !Object.values(VCardPropertyVersionValues).includes(versionValue as VCardPropertyVersionValues)) {
		throw new Error(`Invalid vCard data: unsupported VERSION value ${String(versionValue)}`)
	}

	return new VCard(versionValue as VCardPropertyVersionValues, properties)
}

/**
 *
 * @param data
 */
function deserializeProperty(data: string, options?: {}): VPropertyBase | null {
	let name: string | null = null
	let group: string | null = null
	const params = new VParameterCollection()
	let remaining: string
	// extract the property name and group (if any)
	({ name, group, remaining } = extractPropertyHeader(data))
	// if the next segment start with ';', we have parameters
	while (remaining.startsWith(';')) {
		let result: { name: string; value: string; remainder: string } | null
		// Strip the leading semicolon and extract the next parameter
		remaining = remaining.substring(1)
		result = extractPropertyParameter(remaining)
		if (!result) {
			throw new Error(`Invalid property parameter: ${data}`)
		}
		remaining = result?.remainder.trimStart()
		const parameterName = result.name.toUpperCase()
		const rawParameterValue = result.value.startsWith('"') && result.value.endsWith('"')
			? result.value.slice(1, -1)
			: result.value
		const parameterValue = decodeParameterValue(rawParameterValue)
		params[parameterName] = new VParameterObject(parameterName, parameterValue)
	}
	// the remaining part should start with ':', followed by the value
	const rawValue = remaining.slice(1)
	// instantiate the property object
	if (!name) {
		return new VPropertyBase('', decodePropertyValue(rawValue), group, params)
	}
	const PropertyType = knownProperties[name.toUpperCase()]
	if (PropertyType === VPropertyBase) {
		return new VPropertyBase(name, decodePropertyValue(rawValue), group, params)
	}
	if (PropertyType) {
		return new PropertyType(name, rawValue, group, params)
	}
	return new VPropertyBase(name, decodePropertyValue(rawValue), group, params)
}

export function serializeProperty(property: VPropertyBaseInterface<unknown>): string {
	const group = property.hasGroup ? `${property.group}.` : ''
	const parameters = encodeParameters(property.params)
	const header = `${group}${property.name}${parameters ? `;${parameters}` : ''}`

	return `${header}:${serializePropertyValue(property.value)}`
}

function serializePropertyValue(value: unknown): string {
	if (value === null || value === undefined) return ''
	if (typeof value === 'string') return encodePropertyValue(value)
	if (Array.isArray(value)) {
		return value.map(item => encodePropertyValue(String(item))).join(',')
	}
	if (typeof value === 'object' && 'serialize' in value
		&& typeof value.serialize === 'function') {
		return value.serialize()
	}
	return String(value)
}

export function serialize(cards: VCardInterface | VCardInterface[]): string {
	return (Array.isArray(cards) ? cards : [cards])
		.map(serializeCard)
		.join('')
}

function serializeCard(card: VCardInterface): string {
	const lines = [
		'BEGIN:VCARD',
		`VERSION:${card.version}`,
		...card.properties
			.filter(property => property.name.toUpperCase() !== 'VERSION')
			.map(property => foldContentLine(serializeProperty(property))),
		'END:VCARD',
	]

	return `${lines.join('\r\n')}\r\n`
}

/**
 *
 * @param data
 */
function extractPropertyHeader(data: string, options?: {}): { name: string; group: string | null; remaining: string } {

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

/**
 * Extracts the first parameter from a vCard property string.
 *
 * @param data The vCard line starting with the parameter (e.g., 'TYPE=WORK;...').
 * @return An object with the name, value, and the new remainder, or null if no parameter is found.
 */
function extractPropertyParameter(data: string): { name: string; value: string; remainder: string } | null {
	// Regex to find param name and its value (quoted or unquoted)
	const paramRegex = /^([a-zA-Z0-9-]+)=("(?:[^"]*)"|[^;:]+)/

	const match = data.match(paramRegex)

	if (match) {
		// match[0] is the full matched string (e.g., "TYPE=home")
		// match[1] is the parameter name (Capture Group 1)
		// match[2] is the parameter value (Capture Group 2)
		const name = match[1]
		const value = match[2]

		// The new remainder is the part of the string after the full match
		const newRemainder = data.substring(match[0].length)

		return { name, value, remainder: newRemainder }
	}

	// No parameter found at the start of the string
	return null
}

/**
 * Utility to create an empty vCard skeleton (vCard 3.0 or 4.0)
 *
 * @param version
 */
export function createCard(version: '3.0' | '4.0' = '4.0'): VCard {
	let v: VCardPropertyVersionValues
	if (typeof version === 'string') {
		v = VCardPropertyVersionValues[('V' + version.replace('.', '_')) as keyof typeof VCardPropertyVersionValues] ?? VCardPropertyVersionValues.V3_0
	} else {
		v = version
	}
	return new VCard(v, new VPropertyCollection())
}

export default {
	createCard,
	deserialize,
	deserializeCard,
	serialize,
}
