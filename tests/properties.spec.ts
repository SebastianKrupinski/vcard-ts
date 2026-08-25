import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'
import { VPropertyAddressType } from '../src/properties/VPropertyAddressType'
import { VPropertyDateValue } from '../src/properties/VPropertyDateValue'
import { VPropertyNameType } from '../src/properties/VPropertyNameType'
import { VPropertyOrganizationType } from '../src/properties/VPropertyOrganizationType'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'
import { VPropertyUriType } from '../src/properties/VPropertyUriType'

const CARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:Dr. Jane Doe',
  'N:Doe;Jane;Quinn;Dr.;PhD',
  'ADR:;;123 Main St;Toronto;ON;M5V 1A1;Canada',
  'ORG:Acme;Research',
  'BDAY:1990-05-02',
  'TEL:tel:+14165550123',
  'URL:https://example.com/profile',
  'X-CUSTOM:custom value',
  'END:VCARD',
].join('\r\n')

describe('property deserialization', () => {
  it('creates the registered property classes', () => {
    const card = deserializeCard(CARD)

    expect(card.formattedName).toBeInstanceOf(VPropertyTextType)
    expect(card.name).toBeInstanceOf(VPropertyNameType)
    expect(card.addresses).toEqual([expect.any(VPropertyAddressType)])
    expect(card.telephones).toEqual([expect.any(VPropertyUriType)])
    expect(card.first('ORG')).toBeInstanceOf(VPropertyOrganizationType)
    expect(card.first('URL')).toBeInstanceOf(VPropertyUriType)
  })

  it('deserializes structured name and address values', () => {
    const card = deserializeCard(CARD)
    const name = card.name?.value
    const address = card.first('ADR')

    expect(name).toMatchObject({
      family: 'Doe',
      given: 'Jane',
      additional: 'Quinn',
      prefix: 'Dr.',
      suffix: 'PhD',
    })

    expect(address).not.toBeNull()
    if (!(address instanceof VPropertyAddressType)) return

    expect(address.value).toMatchObject({
      street: '123 Main St',
      locality: 'Toronto',
      region: 'ON',
    })
  })

  it('deserializes temporal values according to their detected type', () => {
    const birthday = deserializeCard(CARD).birthDay?.value

    expect(birthday).toBeInstanceOf(VPropertyDateValue)
    expect(birthday).toMatchObject({ year: 1990, month: 5, day: 2 })
  })

  it('preserves unknown extensions as generic properties', () => {
    const custom = deserializeCard(CARD).first('X-CUSTOM')

    expect(custom).toBeInstanceOf(VPropertyBase)
    expect(custom?.constructor).toBe(VPropertyBase)
    expect(custom?.value).toBe('custom value')
  })

  it('distinguishes escaped newlines from literal backslash text', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'NOTE:Line one\\nLine two',
      'X-LITERAL:Literal\\\\n text',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('NOTE')?.value).toBe('Line one\nLine two')
    expect(card.first('X-LITERAL')?.value).toBe('Literal\\n text')
  })

  it('preserves escaped separators in structured names', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'N:Doe\\;Sr.;Jane\\, Marie;;;',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.name?.value).toMatchObject({
      family: 'Doe;Sr.',
      given: 'Jane, Marie',
    })
  })

  it('preserves escaped separators in structured addresses', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'ADR:;;123 Main St\\; Unit 4;Toronto;ON;M5V 1A1;Canada',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.addresses[0]?.value).toMatchObject({
      street: '123 Main St; Unit 4',
      locality: 'Toronto',
      region: 'ON',
    })
  })

  it('preserves escaped separators in organization values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'ORG:Example\\; Holdings;Research\\, Development',
      'END:VCARD',
    ].join('\r\n'))

    const organization = card.first('ORG')

    expect(organization?.value).toMatchObject({
      name: 'Example; Holdings',
      unit: 'Research, Development',
    })
  })
})
