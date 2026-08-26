import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyBinaryValue } from '../src/properties/VPropertyBinaryValue'
import { VPropertyMediaType } from '../src/properties/VPropertyMediaType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('media properties', () => {
  it.each([
    ['PHOTO', 'JPEG'],
    ['LOGO', 'PNG'],
    ['SOUND', 'BASIC'],
  ])('round-trips an inline vCard 3.0 %s value', (name, mediaType) => {
    const line = `${name};ENCODING=b;TYPE=${mediaType}:SGVsbG8=`
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      line,
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first(name)

    expect(property).toBeInstanceOf(VPropertyMediaType)
    const value = (property as unknown as VPropertyMediaType).value
    expect(value).toBeInstanceOf(VPropertyBinaryValue)
    expect((value as VPropertyBinaryValue).data).toBe('SGVsbG8=')
    expect(serialize(card)).toContain(`${line}\r\n`)
  })

  it('recognizes an explicit binary value type', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'PHOTO;VALUE=binary;ENCODING=b;TYPE=JPEG:SGVsbG8=',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('PHOTO')?.value).toBeInstanceOf(VPropertyBinaryValue)
  })

  it.each([
    ['PHOTO', 'https://example.com/jane.jpg'],
    ['LOGO', 'https://example.com/logo.svg'],
    ['SOUND', 'https://example.com/jane.ogg'],
  ])('retains URI-backed %s values', (name, uri) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      `${name}:${uri}`,
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first(name)?.value).toBeInstanceOf(VPropertyUriValue)
    expect(serialize(card)).toContain(`${name}:${uri}\r\n`)
  })
})
