import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyNameType } from '../src/properties/VPropertyNameType'

describe('name properties', () => {
  it('deserializes every structured name component', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Dr. Jane Doe',
      'N:Doe;Jane;Quinn;Dr.;PhD',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.name).toBeInstanceOf(VPropertyNameType)
    expect(card.name?.value).toMatchObject({
      family: 'Doe',
      given: 'Jane',
      additional: 'Quinn',
      prefix: 'Dr.',
      suffix: 'PhD',
    })
  })

  it('preserves escaped separators', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'N:Doe\\;Sr.;Jane\\, Marie;;;',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.name?.value).toMatchObject({
      family: 'Doe;Sr.',
      given: 'Jane, Marie',
    })
  })
})
