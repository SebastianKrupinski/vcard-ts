import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'
import { VPropertyBinaryValue } from '../src/properties/VPropertyBinaryValue'
import { VPropertyClientPidMapValue } from '../src/properties/VPropertyClientPidMapValue'
import { VPropertyTimestampValue } from '../src/properties/VPropertyTimestampValue'
import { VPropertyUtcOffsetValue } from '../src/properties/VPropertyUtcOffsetValue'

function fixture(path: string): string {
  return readFileSync(new URL(`./fixtures/${path}`, import.meta.url), 'utf8')
}

function comparableCard(card: ReturnType<typeof deserializeCard>) {
  return {
    version: card.version,
    properties: card.properties.map(serializeProperty),
  }
}

describe('valid vCard fixtures', () => {
  it('deserializes a basic vCard 3.0 contact', () => {
    const card = deserializeCard(fixture('valid/v3-basic.vcf'))

    expect(card.version).toBe('3.0')
    expect(card.formattedName?.value).toBe('Jane Doe')
    expect(card.name?.value).toMatchObject({ family: 'Doe', given: 'Jane' })
    expect(card.telephones).toHaveLength(1)
  })

  it('detects the version from a vCard 4.0 contact', () => {
    const card = deserializeCard(fixture('valid/v4-basic.vcf'))

    expect(card.version).toBe('4.0')
    expect(card.kind?.value).toBe('individual')
    expect(card.formattedName?.value).toBe('John Smith')
  })

  it('covers vCard 3.0 legacy value forms', () => {
    const card = deserializeCard(fixture('valid/v3-conformance.vcf'))

    expect(card.first('TZ')?.value).toBeInstanceOf(VPropertyUtcOffsetValue)
    expect(card.first('TZ')?.value).toMatchObject({ offset: -300, extended: true })
    expect(card.first('GEO')?.value).toMatchObject({
      latitude: 37.386013,
      longitude: -122.082932,
      uri: false,
    })
    expect(card.first('PHOTO')?.value).toBeInstanceOf(VPropertyBinaryValue)
    expect(card.first('AGENT')?.value).toContain('BEGIN:VCARD\nFN:Susan Thomas')
  })

  it('covers vCard 4.0 typed and synchronization values', () => {
    const card = deserializeCard(fixture('valid/v4-conformance.vcf'))

    expect(card.first('TZ')?.value).toBeInstanceOf(VPropertyUtcOffsetValue)
    expect(card.first('TZ')?.value).toMatchObject({ offset: -300, extended: false })
    expect(card.first('CLIENTPIDMAP')?.value)
      .toBeInstanceOf(VPropertyClientPidMapValue)
    expect(card.first('CLIENTPIDMAP')?.value).toMatchObject({ sourceId: 1 })
    expect(card.first('CREATED')?.value).toBeInstanceOf(VPropertyTimestampValue)
    expect(card.birthPlace?.value).toBe('Toronto, Ontario')
  })

  it('unfolds physical lines before parsing properties', () => {
    const card = deserializeCard(fixture('valid/folded-lines.vcf'))
    const note = card.first('NOTE')

    expect(note?.value)
      .toBe('This value is deliberately folded across two physical lines.')
  })

  it('decodes escaped text values', () => {
    const card = deserializeCard(fixture('valid/escaped-text.vcf'))
    const note = card.first('NOTE')

    expect(card.formattedName?.value).toBe('Doe, Jane')
    expect(note?.value)
      .toBe('Line one\nLine two; with a semicolon, and a comma')
  })

  it('preserves property groups and parameters', () => {
    const card = deserializeCard(fixture('valid/grouped-properties.vcf'))
    const email = card.first('EMAIL')

    expect(email?.group).toBe('item1')
    expect(email?.params.TYPE?.value).toBe('HOME')
    expect(email?.params.PREF?.value).toBe('1')
    expect(card.first('X-ABLabel')).not.toBeNull()
  })

  it('retains unknown extension properties in the generic model', () => {
    const card = deserializeCard(fixture('valid/extensions.vcf'))

    for (const name of ['X-SOCIALPROFILE', 'X-CUSTOM-FIELD']) {
      const property = card.first(name)
      expect(property).toBeInstanceOf(VPropertyBase)
      expect(property?.constructor).toBe(VPropertyBase)
    }
  })

  it.each([
    'valid/v3-basic.vcf',
    'valid/v3-conformance.vcf',
    'valid/v4-basic.vcf',
    'valid/v4-conformance.vcf',
    'valid/folded-lines.vcf',
    'valid/escaped-text.vcf',
    'valid/grouped-properties.vcf',
    'valid/extensions.vcf',
  ])('round-trips %s without changing its card data', path => {
    const original = deserializeCard(fixture(path))
    const roundTripped = deserializeCard(serialize(original))

    expect(comparableCard(roundTripped)).toEqual(comparableCard(original))
  })
})

describe('invalid vCard fixtures', () => {
  it.each([
    'invalid/missing-begin.vcf',
    'invalid/missing-end.vcf',
    'invalid/malformed-property.vcf',
  ])('rejects %s', path => {
    expect(() => deserializeCard(fixture(path))).toThrow()
  })
})
