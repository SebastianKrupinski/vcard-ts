import { describe, expect, it } from 'vitest'
import * as api from '../src'
import { encodeProperty } from '../src/codecs/property'

import {
  createCard,
  deserialize,
  deserializeCard,
  serialize,
  VCard,
  VCardVersion,
  VPropertyTextType,
} from '../src'

const CARD = [
  'BEGIN:VCARD',
  'VERSION:4.0',
  'FN:Primary Name',
  'EMAIL:first@example.com',
  'EMAIL:second@example.com',
  'END:VCARD',
].join('\r\n')

describe('public API', () => {
  it('preserves serializeProperty as the public property encoder', () => {
    expect(api.serializeProperty).toBe(encodeProperty)
    expect(api.serializeProperty(new VPropertyTextType('NOTE', 'one,two')))
      .toBe('NOTE:one\\,two')
    expect(api).not.toHaveProperty('encodeProperty')
    expect(api).not.toHaveProperty('decodeProperty')
  })

  it('keeps parameter parsing helpers outside the package API', () => {
    expect(api).not.toHaveProperty('parseParameter')
    expect(api).not.toHaveProperty('decodeParameters')
    expect(api).not.toHaveProperty('encodeParameters')
    expect(api).not.toHaveProperty('createParameter')
    expect(api.VParameterObject).not.toHaveProperty('fromSource')
    expect(api.VParameterObject.prototype).not.toHaveProperty('appendSource')
  })

  it('exposes canonical single-card and multi-card deserializers', () => {
    expect(deserializeCard(CARD)).toBeInstanceOf(VCard)
    expect(deserialize(`${CARD}\r\n${CARD}`)).toHaveLength(2)
  })

  it('serializes a card with its authoritative version and CRLF lines', () => {
    const card = deserializeCard(CARD)
    card.version = VCardVersion.V3_0

    expect(serialize(card)).toBe([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Primary Name',
      'EMAIL:first@example.com',
      'EMAIL:second@example.com',
      'END:VCARD',
      '',
    ].join('\r\n'))
  })

  it('serializes the card array returned by deserialize', () => {
    const cards = deserialize(`${CARD}\r\n${CARD}`)

    expect(serialize(cards)).toBe(`${CARD}\r\n${CARD}\r\n`)
  })

  it('provides predictable first and all property accessors', () => {
    const card = deserializeCard(CARD)

    expect(card.first('fn')).toBeInstanceOf(VPropertyTextType)
    expect(card.first('missing')).toBeNull()
    expect(card.all('email')).toHaveLength(2)
    expect(card.all('missing')).toEqual([])
    expect(card.emails).toHaveLength(2)
    expect(card.emails.map(email => email.value)).toEqual([
      'first@example.com',
      'second@example.com',
    ])
  })

  it('creates empty editable cards for supported output versions', () => {
    expect(createCard('3.0')).toMatchObject({ version: '3.0', properties: [] })
    expect(createCard('4.0')).toMatchObject({ version: '4.0', properties: [] })
  })

  it('finds properties by their stable identifier', () => {
    const card = deserializeCard(CARD)
    const property = card.first('FN')

    expect(property).not.toBeNull()
    expect(card.findById(property!.id)).toBe(property)
    expect(card.findById('missing')).toBeNull()
  })
})
