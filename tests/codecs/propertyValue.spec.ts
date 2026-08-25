import { describe, expect, it } from 'vitest'

import {
  decodePropertyValue,
  encodePropertyValue,
  splitPropertyValue,
} from '../../src/codecs/propertyValue'
import { VPropertyNameValue } from '../../src/properties/VPropertyNameValue'
import { VPropertyAddressValue } from '../../src/properties/VPropertyAddressValue'
import { VPropertyOrganizationValue } from '../../src/properties/VPropertyOrganizationValue'

describe('property value codec', () => {
  it('encodes and decodes text escape sequences', () => {
    const value = 'Line one\nDoe, Jane; C:\\Contacts'
    const encoded = 'Line one\\nDoe\\, Jane\\; C:\\\\Contacts'

    expect(encodePropertyValue(value)).toBe(encoded)
    expect(decodePropertyValue(encoded)).toBe(value)
  })

  it('splits structured values without consuming escapes', () => {
    const parts = splitPropertyValue('Doe\\;Sr.;Jane\\, Marie;;;', ';')

    expect(parts).toEqual(['Doe\\;Sr.', 'Jane\\, Marie', '', '', ''])
    expect(parts.map(decodePropertyValue)).toEqual([
      'Doe;Sr.',
      'Jane, Marie',
      '',
      '',
      '',
    ])
  })

  it('encodes structured name components before joining them', () => {
    const name = new VPropertyNameValue('Doe;Sr.', 'Jane, Marie')

    expect(name.serialize()).toBe('Doe\\;Sr.;Jane\\, Marie;;;')
  })

  it('encodes structured address components before joining them', () => {
    const address = new VPropertyAddressValue(
      undefined,
      undefined,
      '123 Main; Unit 4',
      'Toronto, GTA',
      undefined,
      undefined,
      'Canada',
    )

    expect(address.serialize())
      .toBe(';;123 Main\\; Unit 4;Toronto\\, GTA;;;Canada')
  })

  it('encodes structured organization components before joining them', () => {
    const organization = new VPropertyOrganizationValue(
      'Example; Inc.',
      'Research, Development',
    )

    expect(organization.serialize())
      .toBe('Example\\; Inc.;Research\\, Development')
    expect(new VPropertyOrganizationValue('Example').serialize())
      .toBe('Example;')
  })
})
