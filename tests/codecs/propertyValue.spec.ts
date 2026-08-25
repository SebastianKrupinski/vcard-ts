import { describe, expect, it } from 'vitest'

import {
  decodePropertyValue,
  encodePropertyValue,
  splitPropertyValue,
} from '../../src/codecs/propertyValue'
import { VPropertyNameValue } from '../../src/properties/VPropertyNameValue'

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
})
