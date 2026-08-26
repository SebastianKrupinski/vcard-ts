import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyAddressType } from '../src/properties/VPropertyAddressType'

const CARD = [
  'BEGIN:VCARD',
  'VERSION:4.0',
  'FN:Jane Doe',
  'ADR:;;123 Main St;Toronto;ON;M5V 1A1;Canada',
  'END:VCARD',
].join('\r\n')

describe('address properties', () => {
  it('deserializes every scalar address component', () => {
    const address = deserializeCard(CARD).addresses[0]

    expect(address).toBeInstanceOf(VPropertyAddressType)
    expect(address?.value).toMatchObject({
      poBox: null,
      extended: null,
      street: '123 Main St',
      locality: 'Toronto',
      region: 'ON',
      code: 'M5V 1A1',
      country: 'Canada',
    })
  })

  it('edits and serializes every scalar address component', () => {
    const card = deserializeCard(CARD)
    const address = card.addresses[0]?.value
    if (!address) return

    address.poBox = 'PO Box 1'
    address.extended = 'Suite 200'
    address.street = '456 King St'
    address.locality = 'Ottawa'
    address.region = 'ON'
    address.code = 'K1A 0A6'
    address.country = 'Canada'

    expect(serialize(card)).toContain(
      'ADR:PO Box 1;Suite 200;456 King St;Ottawa;ON;K1A 0A6;Canada\r\n',
    )
  })

  it('preserves escaped separators', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'ADR:;;123 Main St\\; Unit 4;Toronto;ON;M5V 1A1;Canada',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.addresses[0]?.value).toMatchObject({
      street: '123 Main St; Unit 4',
      locality: 'Toronto',
      region: 'ON',
    })
  })
})
