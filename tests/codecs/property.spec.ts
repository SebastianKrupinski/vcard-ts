import { describe, expect, it } from 'vitest'

import { decodeProperty, encodeProperty } from '../../src/codecs/property'
import { VParameterCollection } from '../../src/parameters/VParameterObject'
import { VPropertyNameType } from '../../src/properties/VPropertyNameType'
import { VPropertyNameValue } from '../../src/properties/VPropertyNameValue'
import { VPropertyStringCollectionType } from '../../src/properties/VPropertyStringCollectionType'
import { VPropertyTextType } from '../../src/properties/VPropertyTextType'
import { VPropertyBase } from '../../src/properties/VPropertyBase'
import { VPropertyValueBase } from '../../src/properties/VPropertyValueBase'

describe('property codec', () => {
  it.each(['\r', '\n', '\r\n'])('rejects newline %j returned by a custom value serializer', newline => {
    class UnsafeValue extends VPropertyValueBase {
      serialize(): string { return `safe${newline}EMAIL:evil@example.com` }
      type(): string { return 'TEXT' }
    }
    const property = new VPropertyBase('X-CUSTOM', new UnsafeValue())

    expect(() => encodeProperty(property)).toThrow('Invalid property line: unescaped line break')
  })

  it('decodes a grouped typed property and preserves parameter source', () => {
    const line = 'item1.NOTE;TYPE="a,b";TYPE=work:Line one\\nDoe\\, Jane'
    const property = decodeProperty(line)!

    expect(property).toBeInstanceOf(VPropertyTextType)
    expect(property.group).toBe('item1')
    expect(property.value).toBe('Line one\nDoe, Jane')
    expect(property.params.TYPE?.list).toEqual(['a,b', 'work'])
    expect(encodeProperty(property)).toBe(line)
  })

  it('decodes unknown properties as text in a base property', () => {
    const property = decodeProperty('X-CUSTOM:one\\;two\\,three')!

    expect(property.constructor).toBe(VPropertyBase)
    expect(property.value).toBe('one;two,three')
    expect(encodeProperty(property)).toBe('X-CUSTOM:one\\;two\\,three')
  })

  it.each(['NOTE', ':value', 'NOTE;TYPE:value'])('rejects a malformed property line %s', line => {
    expect(() => decodeProperty(line)).toThrow()
  })

  it('serializes a grouped text property with parameters', () => {
    const property = new VPropertyTextType(
      'NOTE',
      'Line one\nDoe, Jane',
      'item1',
      new VParameterCollection([{ name: 'LANGUAGE', value: 'en' }]),
    )

    expect(encodeProperty(property))
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

    expect(encodeProperty(name)).toBe('N:Doe\\;Sr.;Jane;;;')
    expect(encodeProperty(categories)).toBe('CATEGORIES:One\\, Two,Three')
  })
})
