import { describe, expect, it } from 'vitest'

import { serializeProperty } from '../src/VCard'
import { VParameterCollection } from '../src/parameters/VParameterObject'
import { VPropertyTextOrUriType } from '../src/properties/VPropertyTextOrUriType'
import { VPropertyUriOrTextType } from '../src/properties/VPropertyUriOrTextType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('URI-or-text properties', () => {
  it('uses URI as the default value type', () => {
    const property = new VPropertyUriOrTextType(
      'UID',
      'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    )

    expect(property.value).toBeInstanceOf(VPropertyUriValue)
    expect(serializeProperty(property))
      .toBe('UID:urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
  })

  it('respects an explicit text value type', () => {
    const property = new VPropertyUriOrTextType(
      'UID',
      'Local\\, identifier',
      undefined,
      new VParameterCollection([{ name: 'VALUE', value: 'text' }]),
    )

    expect(property.value).toBe('Local, identifier')
    expect(serializeProperty(property))
      .toBe('UID;VALUE=text:Local\\, identifier')
  })

  it('supports properties whose default value type is text', () => {
    const text = new VPropertyTextOrUriType('BIRTHPLACE', 'Toronto\\, Ontario')
    const uri = new VPropertyTextOrUriType(
      'BIRTHPLACE',
      'geo:43.6532,-79.3832',
      undefined,
      new VParameterCollection([{ name: 'VALUE', value: 'uri' }]),
    )

    expect(text.value).toBe('Toronto, Ontario')
    expect(uri.value).toBeInstanceOf(VPropertyUriValue)
  })
})
