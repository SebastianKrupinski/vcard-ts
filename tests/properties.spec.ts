import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'
import { VPropertyAddressType } from '../src/properties/VPropertyAddressType'
import { VPropertyDateValue } from '../src/properties/VPropertyDateValue'
import { VPropertyNameType } from '../src/properties/VPropertyNameType'
import { VPropertyOrganizationType } from '../src/properties/VPropertyOrganizationType'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'
import { VPropertyTextOrUriType } from '../src/properties/VPropertyTextOrUriType'
import { VPropertyTemporalType } from '../src/properties/VPropertyTemporalType'
import { VPropertyTimestampValue } from '../src/properties/VPropertyTimestampValue'
import { VPropertyUriType } from '../src/properties/VPropertyUriType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

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
    expect(card.telephones).toEqual([expect.any(VPropertyTextOrUriType)])
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
      poBox: null,
      extended: null,
      street: '123 Main St',
      locality: 'Toronto',
      region: 'ON',
      code: 'M5V 1A1',
      country: 'Canada',
    })
  })

  it('edits and serializes every scalar address component', () => {
    const card = deserializeCard(CARD)
    const address = card.addresses[0]?.value
    if (!address) return

    address.poBox = 'PO Box 1'
    address.extended = 'Suite 200'
    address.street = '456 King St'
    address.locality = 'Ottawa'
    address.region = 'ON'
    address.code = 'K1A 0A6'
    address.country = 'Canada'

    expect(serialize(card)).toContain(
      'ADR:PO Box 1;Suite 200;456 King St;Ottawa;ON;K1A 0A6;Canada\r\n',
    )
  })

  it('deserializes temporal values according to their detected type', () => {
    const birthday = deserializeCard(CARD).birthDay?.value

    expect(birthday).toBeInstanceOf(VPropertyDateValue)
    expect(birthday).toMatchObject({ year: 1990, month: 5, day: 2 })
  })

  it('deserializes and serializes timestamp properties', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'REV:20260826T142530Z',
      'CREATED:20240115T091500Z',
      'END:VCARD',
    ].join('\r\n'))
    const created = card.first('CREATED')

    expect(card.revision).toBeInstanceOf(VPropertyTemporalType)
    expect(card.revision?.value).toBeInstanceOf(VPropertyTimestampValue)
    expect(card.revision?.value).toMatchObject({
      year: 2026,
      month: 8,
      day: 26,
      hour: 14,
      minute: 25,
      second: 30,
      offset: 0,
    })
    expect(created).toBeInstanceOf(VPropertyTemporalType)
    expect(serialize(card)).toContain('REV:20260826T142530Z\r\n')
    expect(serialize(card)).toContain('CREATED:20240115T091500Z\r\n')
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
      'ORG:Example\\; Holdings;Research\\, Development;Product;Design',
      'END:VCARD',
    ].join('\r\n'))

    const organization = card.first('ORG')

    expect(organization?.value).toMatchObject({
      name: 'Example; Holdings',
      units: ['Research, Development', 'Product', 'Design'],
    })
  })

  it('preserves escaped separators in gender identity values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'GENDER:F;non-binary\\; femme',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.gender?.value).toMatchObject({
      sex: 'F',
      identity: 'non-binary; femme',
    })
  })

  it('deserializes comma-separated text collections', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'NICKNAME:Jane,J.D.\\, Junior',
      'CATEGORIES:Friend,Research\\, Development',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('NICKNAME')?.value).toEqual(['Jane', 'J.D., Junior'])
    expect(card.first('CATEGORIES')?.value).toEqual(['Friend', 'Research, Development'])
  })

  it('preserves URI content after the first colon', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'URL:https://example.com:8443/profile',
      'TEL:12345',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('URL')?.value).toMatchObject({
      scheme: 'https',
      reference: '//example.com:8443/profile',
    })
    expect(card.first('TEL')?.value).toBe('12345')
  })

  it.each([
    ['SOURCE', 'https://directory.example.com/jane.vcf'],
    ['IMPP', 'xmpp:jane@example.com'],
    ['MEMBER', 'urn:uuid:03a0e51f-d1aa-4385-8a53-e29025acd8af'],
    ['URL', 'https://example.com/jane'],
    ['FBURL', 'https://example.com/jane.ifb'],
    ['CALADRURI', 'mailto:jane@example.com'],
    ['CALURI', 'https://example.com/jane.ics'],
    ['ORG-DIRECTORY', 'https://directory.example.com/acme'],
    ['CONTACT-URI', 'https://example.com/contact'],
  ])('deserializes and serializes the %s URI property', (name, value) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      `${name}:${value}`,
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first(name)

    expect(property).toBeInstanceOf(VPropertyUriType)
    if (!(property instanceof VPropertyUriType)) return

    const uriProperty = property as unknown as VPropertyUriType
    const uriValue = uriProperty.value
    expect(uriValue).toBeInstanceOf(VPropertyUriValue)
    if (!(uriValue instanceof VPropertyUriValue)) return

    expect(uriValue.serialize()).toBe(value)
    expect(serialize(card)).toContain(`${name}:${value}\r\n`)
  })

  it.each([
    ['3.0', '43.6532;-79.3832'],
    ['4.0', 'geo:43.6532,-79.3832'],
  ])('deserializes vCard %s geographic coordinates', (version, value) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      `VERSION:${version}`,
      'FN:Toronto',
      `GEO:${value}`,
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('GEO')?.value).toMatchObject({
      latitude: 43.6532,
      longitude: -79.3832,
    })
    expect(serialize(card)).toContain(`GEO:${value}\r\n`)
  })

  it('preserves metadata and commas in data URI payloads', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'PHOTO:data:text/plain;charset=utf-8;base64,first,second,third',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('PHOTO')?.value).toMatchObject({
      format: 'text/plain',
      encoding: 'charset=utf-8;base64',
      data: 'first,second,third',
    })
  })

  it('deserializes a reduced date containing only a day', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY:---12',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toMatchObject({
      year: null,
      month: null,
      day: 12,
    })
  })

  it('decodes temporal properties declared as text', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY;VALUE=text:Spring\\, 1985',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toBe('Spring, 1985')
  })

  it('deserializes time-only values with a leading T', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY:T102200-0800',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toMatchObject({
      hour: 10,
      minute: 22,
      second: 0,
      offset: -480,
    })
  })
})
