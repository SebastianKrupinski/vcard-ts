/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { splitVCardBlob, parseVCard, parseAll, serializeVCard, stripTypeQuotes, createEmptyVCard, getFirstValue } from '../VCard'

const SINGLE = 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nN:Doe;John;;;\nEMAIL;TYPE=WORK:j.doe@example.com\nEND:VCARD\n'
const MULTI = SINGLE + '\n' + SINGLE

describe('vcard parser/writer', () => {
	it('splits multi-vcard blobs', () => {
		const parts = splitVCardBlob(MULTI)
		expect(parts.length).toBe(2)
		expect(parts[0]).toContain('BEGIN:VCARD')
	})

	it('parses a single vcard and reads properties', () => {
		const card = parseVCard(SINGLE)
		expect(card.version).toBe('3.0')
		expect(getFirstValue(card, 'FN')).toBe('John Doe')
	})

	it('parses all and skips invalid by default', () => {
		const invalid = 'BEGIN:VCARD\nVERSION:3.0\nFN:Bad\n' // missing END:VCARD
		const comps = parseAll(SINGLE + '\n' + invalid + '\n' + SINGLE)
		expect(comps.length).toBe(2)
	})

	it('serializeVCard returns text and strips TYPE quotes by default', () => {
		const card = parseVCard('BEGIN:VCARD\nVERSION:3.0\nFN:Foo\nTEL;TYPE="WORK":123\nEND:VCARD')
		const out = serializeVCard(card)
		expect(out).toContain('TYPE=WORK')
		expect(out).not.toContain('TYPE="WORK"')
	})

	it('stripTypeQuotes is idempotent', () => {
		const text = 'TEL;TYPE="WORK,VOICE":123'
		expect(stripTypeQuotes(stripTypeQuotes(text))).toBe('TEL;TYPE=WORK,VOICE:123')
	})

	it('createEmptyVCard creates a skeleton with version', () => {
		const card = createEmptyVCard('4.0')
		const out = serializeVCard(card)
		expect(out).toContain('VERSION:4.0')
	})
})
