import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyGenderType } from '../src/properties/VPropertyGenderType'

describe('gender properties', () => {
  it('preserves sex and escaped gender identity values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'GENDER:F;non-binary\\; femme',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.gender).toBeInstanceOf(VPropertyGenderType)
    expect(card.gender?.value).toMatchObject({
      sex: 'F',
      identity: 'non-binary; femme',
    })
  })
})
