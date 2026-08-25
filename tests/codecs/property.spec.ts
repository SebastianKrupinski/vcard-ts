import { describe, expect, it } from 'vitest'

import { serializeProperty } from '../../src/VCard'
import { VParameterCollection } from '../../src/parameters/VParameterObject'
import { VPropertyNameType } from '../../src/properties/VPropertyNameType'
import { VPropertyNameValue } from '../../src/properties/VPropertyNameValue'
import { VPropertyStringCollectionType } from '../../src/properties/VPropertyStringCollectionType'
import { VPropertyTextType } from '../../src/properties/VPropertyTextType'

describe('property codec', () => {
  it('serializes a grouped text property with parameters', () => {
    const property = new VPropertyTextType(
      'NOTE',
      'Line one\nDoe, Jane',
      'item1',
      new VParameterCollection([{ name: 'LANGUAGE', value: 'en' }]),
    )

    expect(serializeProperty(property))
      .toBe('item1.NOTE;LANGUAGE=en:Line one\\nDoe\\, Jane')
  })

  it('serializes structured and collection property values', () => {
    const name = new VPropertyNameType(
      'N',
      new VPropertyNameValue('Doe;Sr.', 'Jane'),
    )
    const categories = new VPropertyStringCollectionType(
      'CATEGORIES',
      ['One, Two', 'Three'],
    )

    expect(serializeProperty(name)).toBe('N:Doe\\;Sr.;Jane;;;')
    expect(serializeProperty(categories)).toBe('CATEGORIES:One\\, Two,Three')
  })
})
