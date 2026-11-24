import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyBinaryValue } from '../src/properties/VPropertyBinaryValue'
import { VPropertyMediaType } from '../src/properties/VPropertyMediaType'
import { VPropertyUriDataValue } from '../src/properties/VPropertyUriDataValue'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('media properties', () => {
  it.each<[string, string | null, string | null, string]>([
    ['data:image/svg+xml,%3Csvg%3E', 'image/svg+xml', null, '%3Csvg%3E'],
    ['data:;base64,AAAA', null, 'base64', 'AAAA'],
    ['data:,hello%20world', null, null, 'hello%20world'],
    ['data:,', null, null, ''],
    ['data:text/plain;charset=utf-8,hello', 'text/plain', 'charset=utf-8', 'hello'],
  ])('preserves optional metadata in %s', (uri, format, encoding, data) => {
    const source = [
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      `PHOTO:${uri}`,
      'END:VCARD',
      '',
    ].join('\r\n')
    const card = deserializeCard(source)

    expect(card.photos[0].value).toMatchObject({ format, encoding, data })
    expect(serialize(card)).toBe(source)
    expect(new VPropertyUriDataValue(data, format, encoding).serialize()).toBe(uri)
  })

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
})
