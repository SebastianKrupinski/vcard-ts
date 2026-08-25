import { describe, expect, it } from 'vitest'

import { deserialize, deserializeCard } from '../src/VCard'

const SINGLE = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:Jane Doe',
  'END:VCARD',
].join('\r\n')

describe('vCard deserialization', () => {
  it('deserializes a single card', () => {
    const card = deserializeCard(SINGLE)

    expect(card.version).toBe('3.0')
    expect(card.formattedName?.value).toBe('Jane Doe')
  })

  it('deserializes multiple cards from one payload', () => {
    const cards = deserialize(`${SINGLE}\r\n${SINGLE}`)

    expect(cards).toHaveLength(2)
    expect(cards.map(card => card.formattedName?.value)).toEqual([
      'Jane Doe',
      'Jane Doe',
    ])
  })

  it('unfolds continued content lines', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane',
      ' Doe',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.formattedName?.value).toBe('JaneDoe')
  })

  it('ignores blank lines inside a card', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      '',
      'FN:Jane Doe',
      '',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.formattedName?.value).toBe('Jane Doe')
  })

  it('rejects a card without an END marker', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
    ].join('\r\n'))).toThrow('missing END:VCARD')
  })

  it('rejects content before the BEGIN marker', () => {
    expect(() => deserializeCard(`unexpected\r\n${SINGLE}`))
      .toThrow('missing BEGIN:VCARD')
  })

  it('rejects content after the END marker', () => {
    expect(() => deserializeCard(`${SINGLE}\r\nunexpected`))
      .toThrow('missing END:VCARD')
  })

  it('rejects nested card markers', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'BEGIN:VCARD',
      'FN:Jane Doe',
      'END:VCARD',
      'END:VCARD',
    ].join('\r\n'))).toThrow('nested card marker')
  })

  it('rejects a missing VERSION property', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))).toThrow('expected exactly one VERSION property, found 0')
  })

  it('rejects duplicate VERSION properties', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'VERSION:4.0',
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))).toThrow('expected exactly one VERSION property, found 2')
  })

  it.each(['2.1', '5.0'])('rejects unsupported VERSION value %s', version => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      `VERSION:${version}`,
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))).toThrow(`unsupported VERSION value ${version}`)
  })
})
