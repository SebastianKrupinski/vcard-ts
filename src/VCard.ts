import { VParameterCollection, VParameterObject } from './parameters/VParameterObject'
import { VPropertyBase } from './properties/VPropertyBase'
import { VCardPropertyVersionValues } from './VCardInterfaces'
import { VCard } from './VCardObjects'
import { knownProperties } from './properties/VPropertyTypes'
import { VPropertyTextType } from './properties/VPropertyTextType'
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

	const lines = unfoldLine(data)
	const properties = new VPropertyCollection()

	for (const rawLine of lines) {
		const line = rawLine.trimEnd()
		if (/^BEGIN:/i.test(line) || /^END:/i.test(line)) continue

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
	let value: string | null = null
	let remaining: string
	// extract the property name and group (if any)
	({ name, group, remaining } = extractPropertyHeader(data))
	// if the next segment start with ';', we have parameters
	while (remaining.startsWith(';')) {
		let result: { name: string; value: string; remainder: string } | null
		// Strip the leading semicolon and extract the next parameter
		remaining = remaining.substring(1)
		result = extractPropertyParameter(remaining)
		// if no parameter found, break to avoid infinite loop
		if (!result) break
		remaining = result?.remainder.trimStart()
		const parameterName = result.name.toUpperCase()
		const parameterValue = result.value.startsWith('"') && result.value.endsWith('"')
			? result.value.slice(1, -1)
			: result.value
		params[parameterName] = new VParameterObject(parameterName, parameterValue)
	}
	// the remaining part should start with ':', followed by the value
	value = decodeValue(remaining.slice(1))
	// instantiate the property object
	if (!name) {
		return new VPropertyBase('', value ?? '', group, params)
	}
	const PropertyType = knownProperties[name.toUpperCase()]
	if (PropertyType) {
		return new PropertyType(name, value, group, params)
	}
	return new VPropertyBase(name, value, group, params)
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
 *
 * @param data
 */
function normalizeNewlines(data: string): string {
	return data.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/**
 *
 * @param v
 */
function decodeValue(v: string): string {
	return v
		.replace(/\\n/gi, '\n')
		.replace(/\\,/g, ',')
		.replace(/\\;/g, ';')
		.replace(/\\\\/g, '\\')
}

/**
 *
 * @param v
 */
function encodeValue(v: string): string {
	return v
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/,/g, '\\,')
		.replace(/;/g, '\\;')
}

/**
 *
 * @param text
 * @param sep
 */
function splitOutsideQuotes(text: string, sep: string): string[] {
	const out: string[] = []
	let current = ''
	let inQuotes = false
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (ch === '"') {
			inQuotes = !inQuotes
			continue
		}
		if (!inQuotes && ch === sep) {
			out.push(current)
			current = ''
		} else {
			current += ch
		}
	}
	out.push(current)
	return out
}

/**
 *
 * @param params
 * @param keepTypeQuotes
 */
function encodeParams(params: Record<string, string[]>, keepTypeQuotes = false): string {
	const out: string[] = []
	for (const [k, values] of Object.entries(params)) {
		const key = k.toUpperCase()
		if (!values || values.length === 0) {
			out.push(key)
			continue
		}
		const encoded = values.map(v => {
			const needsQuotes = /[,:;]/.test(v)
			if (!keepTypeQuotes && key === 'TYPE') return v
			return needsQuotes ? '"' + v + '"' : v
		}).join(',')
		out.push(`${key}=${encoded}`)
	}
	return out.join(';')
}

/**
 *
 * @param line
 * @param newline
 */
function foldLine(line: string, newline: string): string {
	const limit = 75
	if (line.length <= limit) return line
	const parts: string[] = []
	let i = 0
	while (i < line.length) {
		parts.push(line.slice(i, i + limit))
		i += limit
	}
	return parts.join(newline + ' ')
}

/**
 *
 * @param input
 */
function unfoldLine(input: string): string[] {
	const lines = normalizeNewlines(input).split('\n')
	const output: string[] = []
	for (const line of lines) {
		if ((line.startsWith(' ') || line.startsWith('\t')) && output.length > 0) {
			output[output.length - 1] += line.slice(1)
		} else {
			output.push(line)
		}
	}
	return output
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
}
