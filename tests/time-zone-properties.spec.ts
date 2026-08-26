import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyTimeZoneType } from '../src/properties/VPropertyTimeZoneType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'
import { VPropertyUtcOffsetValue } from '../src/properties/VPropertyUtcOffsetValue'

describe('time zone properties', () => {
  it('uses text as the default vCard 4.0 value', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'TZ:America/Toronto',
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first('TZ') as unknown as VPropertyTimeZoneType

    expect(property).toBeInstanceOf(VPropertyTimeZoneType)
    expect(property?.value).toBe('America/Toronto')
    expect(serialize(card)).toContain('TZ:America/Toronto\r\n')
  })

  it('supports explicit URI values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'TZ;VALUE=uri:https://example.com/timezones/America-Toronto',
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first('TZ') as unknown as VPropertyTimeZoneType
    const value = property.value

    expect(value).toBeInstanceOf(VPropertyUriValue)
    expect(serialize(card)).toContain(
      'TZ;VALUE=uri:https://example.com/timezones/America-Toronto\r\n',
    )
  })

  it('supports explicit vCard 4.0 UTC offsets', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'TZ;VALUE=utc-offset:-0500',
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first('TZ') as unknown as VPropertyTimeZoneType
    const value = property.value

    expect(value).toBeInstanceOf(VPropertyUtcOffsetValue)
    if (!(value instanceof VPropertyUtcOffsetValue)) return
    expect(value.offset).toBe(-300)
    expect(value.extended).toBe(false)
    expect(serialize(card)).toContain('TZ;VALUE=utc-offset:-0500\r\n')
  })

  it('recognizes and preserves the default vCard 3.0 offset format', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'TZ:-05:00',
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first('TZ') as unknown as VPropertyTimeZoneType
    const value = property.value

    expect(value).toBeInstanceOf(VPropertyUtcOffsetValue)
    if (!(value instanceof VPropertyUtcOffsetValue)) return
    expect(value.offset).toBe(-300)
    expect(value.extended).toBe(true)
    expect(serialize(card)).toContain('TZ:-05:00\r\n')
  })
})
