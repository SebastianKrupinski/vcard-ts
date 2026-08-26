import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyOrganizationType } from '../src/properties/VPropertyOrganizationType'

describe('organization properties', () => {
  it('preserves the name, multiple units, and escaped separators', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'ORG:Example\\; Holdings;Research\\, Development;Product;Design',
      'END:VCARD',
    ].join('\r\n'))
    const organization = card.first('ORG')

    expect(organization).toBeInstanceOf(VPropertyOrganizationType)
    expect(organization?.value).toMatchObject({
      name: 'Example; Holdings',
      units: ['Research, Development', 'Product', 'Design'],
    })
  })
})
