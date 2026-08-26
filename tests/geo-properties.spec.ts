import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyGeoType } from '../src/properties/VPropertyGeoType'

describe('geographic properties', () => {
  it.each([
    ['3.0', '37.386013;-122.082932'],
    ['4.0', 'geo:37.386013,-122.082932'],
  ])('deserializes and serializes vCard %s coordinates', (version, value) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      `VERSION:${version}`,
      'FN:Toronto',
      'N:Toronto;;;;',
      `GEO:${value}`,
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('GEO')).toBeInstanceOf(VPropertyGeoType)
    expect(card.first('GEO')?.value).toMatchObject({
      latitude: 37.386013,
      longitude: -122.082932,
    })
    expect(serialize(card)).toContain(`GEO:${value}\r\n`)
  })
})
