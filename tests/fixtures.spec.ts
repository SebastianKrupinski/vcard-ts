import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'

function fixture(path: string): string {
  return readFileSync(new URL(`./fixtures/${path}`, import.meta.url), 'utf8')
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

  it('unfolds physical lines before parsing properties', () => {
    const card = deserializeCard(fixture('valid/folded-lines.vcf'))
    const note = card.fetch('NOTE')

    expect(Array.isArray(note) ? null : note?.value)
      .toBe('This value is deliberately folded across two physical lines.')
  })

  it('decodes escaped text values', () => {
    const card = deserializeCard(fixture('valid/escaped-text.vcf'))
    const note = card.fetch('NOTE')

    expect(card.formattedName?.value).toBe('Doe, Jane')
    expect(Array.isArray(note) ? null : note?.value)
      .toBe('Line one\nLine two; with a semicolon, and a comma')
  })

  it('preserves property groups and parameters', () => {
    const card = deserializeCard(fixture('valid/grouped-properties.vcf'))
    const email = card.fetch('EMAIL')

    expect(Array.isArray(email) ? null : email?.group).toBe('item1')
    expect(Array.isArray(email) ? null : email?.params.TYPE?.value).toBe('HOME')
    expect(Array.isArray(email) ? null : email?.params.PREF?.value).toBe('1')
    expect(card.fetch('X-ABLabel')).not.toBeNull()
  })

  it('retains unknown extension properties in the generic model', () => {
    const card = deserializeCard(fixture('valid/extensions.vcf'))

    for (const name of ['X-SOCIALPROFILE', 'X-CUSTOM-FIELD']) {
      const property = card.fetch(name)
      expect(property).toBeInstanceOf(VPropertyBase)
      expect(property?.constructor).toBe(VPropertyBase)
    }
  })

  it.todo('round-trips every valid fixture once card serialization exists')
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
