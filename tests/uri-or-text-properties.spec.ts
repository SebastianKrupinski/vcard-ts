import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VParameterCollection } from '../src/parameters/VParameterObject'
import { VPropertyTextOrUriType } from '../src/properties/VPropertyTextOrUriType'
import { VPropertyUriOrTextType } from '../src/properties/VPropertyUriOrTextType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('URI-or-text properties', () => {
  it('uses URI as the default value type', () => {
    const property = new VPropertyUriOrTextType(
      'UID',
      'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    )

    expect(property.value).toBeInstanceOf(VPropertyUriValue)
    expect(serializeProperty(property))
      .toBe('UID:urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
  })

  it('respects an explicit text value type', () => {
    const property = new VPropertyUriOrTextType(
      'UID',
      'Local\\, identifier',
      undefined,
      new VParameterCollection([{ name: 'VALUE', value: 'text' }]),
    )

    expect(property.value).toBe('Local, identifier')
    expect(serializeProperty(property))
      .toBe('UID;VALUE=text:Local\\, identifier')
  })

  it('supports properties whose default value type is text', () => {
    const text = new VPropertyTextOrUriType('BIRTHPLACE', 'Toronto\\, Ontario')
    const uri = new VPropertyTextOrUriType(
      'BIRTHPLACE',
      'geo:43.6532,-79.3832',
      undefined,
      new VParameterCollection([{ name: 'VALUE', value: 'uri' }]),
    )

    expect(text.value).toBe('Toronto, Ontario')
    expect(uri.value).toBeInstanceOf(VPropertyUriValue)
  })

  it('applies mixed-value types through the property registry', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'UID:urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
      'RELATED;VALUE=text:Jane\\, Doe',
      'KEY:https://example.com/jane.pub',
      'BIRTHPLACE:Toronto\\, Ontario',
      'DEATHPLACE;VALUE=uri:geo:41.731944,-49.945833',
      'SOCIALPROFILE:https://social.example.com/jane',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.uid?.value).toBeInstanceOf(VPropertyUriValue)
    expect(card.first('RELATED')?.value).toBe('Jane, Doe')
    expect(card.first('KEY')?.value).toBeInstanceOf(VPropertyUriValue)
    expect(card.birthPlace?.value).toBe('Toronto, Ontario')
    expect(card.deathPlace?.value).toBeInstanceOf(VPropertyUriValue)
    expect(card.first('SOCIALPROFILE')?.value).toBeInstanceOf(VPropertyUriValue)

    const output = serialize(card)
    expect(deserializeCard(output).first('RELATED')?.value).toBe('Jane, Doe')
    expect(output).toContain('DEATHPLACE;VALUE=uri:geo:41.731944,-49.945833\r\n')
  })

  it('preserves text, phone-number, and URI telephone values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'TEL:12345',
      'TEL;VALUE=phone-number:+1-416-555-0123',
      'TEL;VALUE=uri:tel:+14165550123',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.telephones.map(telephone => telephone.value)).toEqual([
      '12345',
      '+1-416-555-0123',
      expect.any(VPropertyUriValue),
    ])

    const output = serialize(card)
    expect(output).toContain('TEL:12345\r\n')
    expect(output).not.toContain('TEL::12345')
    expect(output).toContain('TEL;VALUE=phone-number:+1-416-555-0123\r\n')
    expect(output).toContain('TEL;VALUE=uri:tel:+14165550123\r\n')
  })
})
