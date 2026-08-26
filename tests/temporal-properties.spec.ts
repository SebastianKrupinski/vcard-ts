import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyDateValue } from '../src/properties/VPropertyDateValue'
import { VPropertyTemporalType } from '../src/properties/VPropertyTemporalType'
import { VPropertyTimestampValue } from '../src/properties/VPropertyTimestampValue'

describe('temporal properties', () => {
  it('deserializes date values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY:1990-05-02',
      'END:VCARD',
    ].join('\r\n'))
    const birthday = card.birthDay?.value

    expect(birthday).toBeInstanceOf(VPropertyDateValue)
    expect(birthday).toMatchObject({ year: 1990, month: 5, day: 2 })
  })

  it('deserializes and serializes timestamp properties', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'REV:20260826T142530Z',
      'CREATED:20240115T091500Z',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.revision).toBeInstanceOf(VPropertyTemporalType)
    expect(card.revision?.value).toBeInstanceOf(VPropertyTimestampValue)
    expect(card.revision?.value).toMatchObject({
      year: 2026,
      month: 8,
      day: 26,
      hour: 14,
      minute: 25,
      second: 30,
      offset: 0,
    })
    expect(card.first('CREATED')).toBeInstanceOf(VPropertyTemporalType)
    expect(serialize(card)).toContain('REV:20260826T142530Z\r\n')
    expect(serialize(card)).toContain('CREATED:20240115T091500Z\r\n')
  })

  it('deserializes reduced dates', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY:---12',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toMatchObject({ year: null, month: null, day: 12 })
  })

  it('decodes temporal properties declared as text', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY;VALUE=text:Spring\\, 1985',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toBe('Spring, 1985')
  })

  it('deserializes time-only values with a leading T', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'BDAY:T102200-0800',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.birthDay?.value).toMatchObject({
      hour: 10,
      minute: 22,
      second: 0,
      offset: -480,
    })
  })
})
