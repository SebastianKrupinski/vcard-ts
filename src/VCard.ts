import { decodeProperty, encodeProperty } from './codecs/property'
import { foldContentLine, normalizeNewlines, unfoldContentLines } from './codecs/contentLine'
import type { VPropertyBaseInterface } from './properties/VPropertyInterfaces'
import { VCardInterface, VCardVersion } from './VCardInterfaces'
import { VCard } from './VCardObjects'
import { propertyCardinalities } from './properties/VPropertyTypes'
import { VPropertyCollection } from './properties/VPropertyCollection'

export { encodeProperty as serializeProperty } from './codecs/property'

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

	for (const [index, line] of lines.entries()) {
		if (line.length === 0) continue
		if (index === 0 || index === lines.length - 1) continue
		if (/^(BEGIN|END):VCARD\s*$/i.test(line)) {
			throw new Error('Invalid vCard data: nested card marker')
		}

		const prop = decodeProperty(line)
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
			.map(property => foldContentLine(encodeProperty(property, card.version))),
		'END:VCARD',
	]

	return `${lines.join('\r\n')}\r\n`
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
