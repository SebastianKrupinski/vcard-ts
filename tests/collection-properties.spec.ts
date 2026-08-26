import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyStringCollectionType } from '../src/properties/VPropertyStringCollectionType'

describe('collection properties', () => {
  it('deserializes comma-separated values and escaped commas', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'NICKNAME:Jane,J.D.\\, Junior',
      'CATEGORIES:Friend,Research\\, Development',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('NICKNAME')).toBeInstanceOf(VPropertyStringCollectionType)
    expect(card.first('NICKNAME')?.value).toEqual(['Jane', 'J.D., Junior'])
    expect(card.first('CATEGORIES')?.value).toEqual(['Friend', 'Research, Development'])
  })
})
