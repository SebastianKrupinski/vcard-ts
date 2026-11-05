import { decodeParameters, encodeParameters } from './codecs/parameter'
import { decodePropertyValue, encodePropertyValue } from './codecs/propertyValue'
import { foldContentLine, normalizeNewlines, unfoldContentLines } from './codecs/contentLine'
import { VPropertyBase } from './properties/VPropertyBase'
import { VPropertyTimeValue } from './properties/VPropertyTimeValue'
import { VParameterValueOptions } from './parameters/VParameterTypes'
import type { VPropertyBaseInterface } from './properties/VPropertyInterfaces'
import { VCardInterface, VCardVersion } from './VCardInterfaces'
import { VCard } from './VCardObjects'
import { propertyTypes, propertyCardinalities } from './properties/VPropertyTypes'
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
		|| !Object.values(VCardVersion).includes(versionValue as VCardVersion)) {
		throw new Error(`Invalid vCard data: unsupported VERSION value ${String(versionValue)}`)
	}

	validatePropertyCardinalities(
		properties,
		versionValue as VCardVersion,
	)

	return new VCard(versionValue as VCardVersion, properties)
}

function validatePropertyCardinalities(
	properties: VPropertyCollection,
	version: VCardVersion,
): void {
	for (const [name, versionRules] of Object.entries(propertyCardinalities)) {
		const rules = versionRules[version]
		if (!rules) continue

		const matches = properties.filter(property => property.name.toUpperCase() === name)
		const count = version === VCardVersion.V4_0
			? countLogicalProperties(matches)
			: matches.length

		if (rules.min !== undefined && count < rules.min) {
			const expectation = rules.max === rules.min
				? `exactly ${rules.min}`
				: `at least ${rules.min}`
			throw new Error(
				`Invalid vCard data: expected ${expectation} ${name} property, found ${count}`,
			)
		}
		if (rules.max !== undefined && count > rules.max) {
			const expectation = rules.min === rules.max
				? `exactly ${rules.max}`
				: `at most ${rules.max}`
			throw new Error(
				`Invalid vCard data: expected ${expectation} ${name} property, found ${count}`,
			)
		}
	}
}

function countLogicalProperties(properties: VPropertyBaseInterface[]): number {
	const alternativeIds = new Set<string>()
	let count = 0

	for (const property of properties) {
		const alternativeId = property.params.ALTID?.value
		if (alternativeId) {
			alternativeIds.add(alternativeId)
		} else {
			count++
		}
	}

	return count + alternativeIds.size
}

/**
 *
 * @param data
 */
function deserializeProperty(data: string, options?: {}): VPropertyBase | null {
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

export function serializeProperty(
	property: VPropertyBaseInterface<unknown>,
	version: VCardVersion = VCardVersion.V4_0,
): string {
	const group = property.hasGroup ? `${property.group}.` : ''
	const parameters = encodeParameters(property.params)
	const header = `${group}${property.name}${parameters ? `;${parameters}` : ''}`

	return `${header}:${serializePropertyValue(property, version)}`
}

function serializePropertyValue(property: VPropertyBaseInterface<unknown>, version: VCardVersion): string {
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
			.map(property => foldContentLine(serializeProperty(property, card.version))),
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
 * Utility to create an empty vCard skeleton (vCard 3.0 or 4.0)
 *
 * @param version
 */
export function createCard(version: '3.0' | '4.0' = '4.0'): VCard {
	let v: VCardVersion
	if (typeof version === 'string') {
		v = VCardVersion[('V' + version.replace('.', '_')) as keyof typeof VCardVersion] ?? VCardVersion.V3_0
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
