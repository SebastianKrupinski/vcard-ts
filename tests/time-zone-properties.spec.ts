import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyTimeZoneType } from '../src/properties/VPropertyTimeZoneType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'
import { VPropertyUtcOffsetValue } from '../src/properties/VPropertyUtcOffsetValue'

describe('time zone properties', () => {
  it.each([
    ['+05', 300],
    ['-03', -180],
    ['+00', 0],
    ['-00', -0],
    ['+23', 1380],
  ])('preserves the hour-only UTC offset %s', (offset, minutes) => {
    const line = `TZ;VALUE=utc-offset:${offset}`
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane Doe', line, 'END:VCARD', ''].join('\r\n')
    const card = deserializeCard(source)

    expect(card.timeZones[0].value).toBeInstanceOf(VPropertyUtcOffsetValue)
    expect((card.timeZones[0].value as VPropertyUtcOffsetValue).offset).toBe(minutes)
    expect(serialize(card)).toBe(source)

    const constructed = new VPropertyTimeZoneType('TZ', offset, null, {
      VALUE: { name: 'VALUE', value: 'utc-offset' },
    })
    expect(serializeProperty(constructed)).toBe(line)

    card.timeZones[0].value = '+0100'
    card.timeZones[0].value = offset
    expect(serializeProperty(card.timeZones[0])).toBe(line)
  })

  it('writes minutes when an hour-only offset is edited', () => {
    const value = new VPropertyUtcOffsetValue().deserialize('+05')
    value.offset = 330

    expect(value.serialize()).toBe('+0530')
  })

  it('applies an explicit format change to an hour-only offset', () => {
    const value = new VPropertyUtcOffsetValue().deserialize('-03')
    value.extended = true
    expect(value.serialize()).toBe('-03:00')

    value.extended = false
    expect(value.serialize()).toBe('-0300')
  })

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
      'N:Doe;Jane;;;',
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
