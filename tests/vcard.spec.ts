import { describe, expect, it } from 'vitest'

import { deserialize, deserializeCard } from '../src/VCard'

const SINGLE = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:Jane Doe',
  'N:Doe;Jane;;;',
  'END:VCARD',
].join('\r\n')

describe('vCard deserialization', () => {
  it.each([
    'END:VCARDjunk',
    'end:VCARDjunk',
    'BEGIN:OTHER',
    'item1.END:VCARD',
    'BEGIN;VALUE=text:VCARD',
    'END;VALUE=text:VCARD',
  ])('rejects the stray boundary property %s', line => {
    for (const version of ['3.0', '4.0']) {
      const source = ['BEGIN:VCARD', `VERSION:${version}`, 'FN:Jane', 'N:Doe;Jane;;;', line, 'END:VCARD'].join('\r\n')
      expect(() => deserializeCard(source)).toThrow('unexpected card boundary property')
    }
  })

  it.each([
    ['NOTE:END:VCARDjunk', 'END:VCARDjunk'],
    ['NOTE:prefix\r\n END:VCARD', 'prefixEND:VCARD'],
  ])('keeps boundary-like text inside a property value: %s', (line, value) => {
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', line, 'END:VCARD'].join('\r\n')
    expect(deserializeCard(source).notes[0].value).toBe(value)
  })

  it('reports stray boundary properties with their card number in batch input', () => {
    const invalid = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', 'END:VCARDjunk', 'END:VCARD'].join('\r\n')
    expect(() => deserialize(`${SINGLE}\r\n${invalid}`))
      .toThrow('card 2 at line 6: Invalid vCard data: unexpected card boundary property: END')
  })

  it.each(['FN:Before Version', 'X-CUSTOM:before version', ''])
    ('rejects a vCard 4.0 VERSION preceded by %j', precedingLine => {
      const source = ['BEGIN:VCARD', precedingLine, 'VERSION:4.0', 'FN:Jane Doe', 'END:VCARD'].join('\r\n')
      expect(() => deserializeCard(source)).toThrow('VERSION must immediately follow BEGIN:VCARD')
    })

  it.each(['VERSION:4.0', 'version:4.0', 'VER\r\n SION:4.0'])
    ('accepts the first unfolded property %j as VERSION', versionLine => {
      const source = ['BEGIN:VCARD', versionLine, '', 'FN:Jane Doe', 'END:VCARD'].join('\r\n')
      expect(deserializeCard(source).version).toBe('4.0')
    })

  it('continues to accept a vCard 3.0 VERSION after other properties', () => {
    const source = ['BEGIN:VCARD', 'FN:Jane Doe', 'N:Doe;Jane;;;', 'VERSION:3.0', 'END:VCARD'].join('\r\n')
    expect(deserializeCard(source).version).toBe('3.0')
  })

  it('reports the card and starting line for a misplaced VERSION in batch input', () => {
    const invalid = ['BEGIN:VCARD', 'FN:Jane Doe', 'VERSION:4.0', 'END:VCARD'].join('\r\n')
    expect(() => deserialize(`${SINGLE}\r\n${invalid}`))
      .toThrow('card 2 at line 6: Invalid vCard data: VERSION must immediately follow BEGIN:VCARD')
  })

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
      'N:Doe;Jane;;;',
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
      'N:Doe;Jane;;;',
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

  it('rejects a card without a required FN property', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'END:VCARD',
    ].join('\r\n'))).toThrow('expected at least 1 FN property, found 0')
  })

  it('rejects a vCard 3.0 card without a required N property', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))).toThrow('expected exactly 1 N property, found 0')
  })
})
