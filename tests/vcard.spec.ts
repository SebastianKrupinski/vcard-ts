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

  it('rejects a card without an END marker', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
    ].join('\r\n'))).toThrow('missing END:VCARD')
  })
})
