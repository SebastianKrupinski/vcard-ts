import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VCardVersion } from '../src/VCardInterfaces'
import { VPropertyDateTimeValue } from '../src/properties/VPropertyDateTimeValue'
import { VPropertyDateValue } from '../src/properties/VPropertyDateValue'
import { VPropertyTemporalType } from '../src/properties/VPropertyTemporalType'
import { VPropertyTimeValue } from '../src/properties/VPropertyTimeValue'
import { VPropertyTimestampValue } from '../src/properties/VPropertyTimestampValue'

function card(version: '3.0' | '4.0', line: string) {
  return deserializeCard([
    'BEGIN:VCARD',
    `VERSION:${version}`,
    'FN:Jane Doe',
    ...(version === '3.0' ? ['N:Doe;Jane;;;'] : []),
    line,
    'END:VCARD',
  ].join('\r\n'))
}

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

describe('reading temporal values', () => {
  it.each([
    ['3.0', 'REV:1995-10-31T22:27:10Z', VPropertyTimestampValue, { year: 1995, month: 10, day: 31, hour: 22, minute: 27, second: 10, offset: 0 }],
    ['3.0', 'REV:1997-11-15', VPropertyDateValue, { year: 1997, month: 11, day: 15 }],
    ['4.0', 'REV:19961022T140000-05', VPropertyTimestampValue, { hour: 14, offset: -300 }],
    ['4.0', 'REV:19961022T140000+0530', VPropertyTimestampValue, { hour: 14, offset: 330 }],
    ['4.0', 'BDAY:1985', VPropertyDateValue, { year: 1985, month: null, day: null }],
    ['4.0', 'BDAY:1985-04', VPropertyDateValue, { year: 1985, month: 4, day: null }],
    ['4.0', 'BDAY:--0412', VPropertyDateValue, { year: null, month: 4, day: 12 }],
    ['4.0', 'BDAY:--04-12', VPropertyDateValue, { year: null, month: 4, day: 12 }],
    ['4.0', 'BDAY:--04', VPropertyDateValue, { year: null, month: 4, day: null }],
    ['4.0', 'BDAY:T-2200', VPropertyTimeValue, { hour: null, minute: 22, second: 0 }],
    ['4.0', 'BDAY:T--00', VPropertyTimeValue, { hour: null, minute: null, second: 0 }],
  ] as const)('%s %s', (version, line, valueType, fields) => {
    const value = card(version, line).first(line.split(':')[0])?.value

    expect(value).toBeInstanceOf(valueType)
    expect(value).toMatchObject(fields)
  })

  it('reads date-times in the extended form', () => {
    const value = card('3.0', 'BDAY:1996-04-15T10:22:00-05:00').birthDay?.value as VPropertyDateTimeValue

    expect(value.date).toMatchObject({ year: 1996, month: 4, day: 15 })
    expect(value.time).toMatchObject({ hour: 10, minute: 22, second: 0, offset: -300 })
  })

  it('reads a negative offset in the basic form', () => {
    const value = card('4.0', 'ANNIVERSARY:20090808T1430-0500').anniversary?.value as VPropertyDateTimeValue

    expect(value.time).toMatchObject({ hour: 14, minute: 30, second: null, offset: -300 })
  })

  it.each([
    ['BDAY:garbage', 'garbage', { year: null, month: null, day: null }],
    ['BDAY:19851332', '19851332', { year: null, month: null, day: null }],
    ['BDAY:19850432', '19850432', { year: null, month: null, day: null }],
    ['BDAY:T2500', 'T2500', { hour: null, minute: null, second: null }],
  ])('leaves the fields of %s empty but keeps its text', (line, source, emptyFields) => {
    expect(card('4.0', line).birthDay?.value).toMatchObject({ source, ...emptyFields })
  })
})

describe('writing temporal values', () => {
  it('writes an edited date in the standard form for the card version', () => {
    const v4 = card('4.0', 'BDAY:1985-04-12')
    ;(v4.birthDay?.value as VPropertyDateValue).day = 13
    expect(serialize(v4)).toContain('BDAY:19850413\r\n')

    const v3 = card('3.0', 'BDAY:19850412')
    ;(v3.birthDay?.value as VPropertyDateValue).day = 13
    expect(serialize(v3)).toContain('BDAY:1985-04-13\r\n')
  })

  it('keeps the correct offset when an edited time is written', () => {
    const v4 = card('4.0', 'ANNIVERSARY:20090808T1430-0500')
    ;(v4.anniversary?.value as VPropertyDateTimeValue).time.minute = 31
    expect(serialize(v4)).toContain('ANNIVERSARY:20090808T1431-0500\r\n')

    const v3 = card('3.0', 'BDAY:1996-04-15T10:22:00+05:30')
    ;(v3.birthDay?.value as VPropertyDateTimeValue).time.second = 1
    expect(serialize(v3)).toContain('BDAY:1996-04-15T10:22:01+05:30\r\n')
  })

  it('only rewrites the part of a date-time that was edited', () => {
    const edited = card('4.0', 'BDAY:1985-04-12T102200Z')
    ;(edited.birthDay?.value as VPropertyDateTimeValue).time.hour = 11

    expect(serialize(edited)).toContain('BDAY:1985-04-12T112200Z\r\n')
  })

  it('writes an edited timestamp in the standard form', () => {
    const v3 = card('3.0', 'REV:19951031T222710Z')
    ;(v3.revision?.value as VPropertyTimestampValue).hour = 23
    expect(serialize(v3)).toContain('REV:1995-10-31T23:27:10Z\r\n')

    const v4 = card('4.0', 'REV:19951031T222710-0500')
    ;(v4.revision?.value as VPropertyTimestampValue).hour = 23
    expect(serialize(v4)).toContain('REV:19951031T232710-0500\r\n')
  })

  it('reports no source once a value is edited', () => {
    const value = new VPropertyDateValue().deserialize('19850412')
    expect(value.source).toBe('19850412')

    value.year = 1986
    expect(value.source).toBeNull()
  })

  it.each([
    [[1985, 4, 12], '19850412', '1985-04-12'],
    [[1985, 4, null], '1985-04', '1985-04'],
    [[1985, null, null], '1985', '1985'],
    [[null, 4, 12], '--0412', '--04-12'],
    [[null, 4, null], '--04', '--04'],
    [[null, null, 12], '---12', '---12'],
    [[null, null, null], '', ''],
  ] as const)('formats the date %j as %s in 4.0 and %s in 3.0', (fields, basic, extended) => {
    const value = new VPropertyDateValue(...fields)

    expect(value.serialize(VCardVersion.V4_0)).toBe(basic)
    expect(value.serialize(VCardVersion.V3_0)).toBe(extended)
    expect(new VPropertyDateValue().deserialize(basic)).toMatchObject({ year: fields[0], month: fields[1], day: fields[2] })
    expect(new VPropertyDateValue().deserialize(extended)).toMatchObject({ year: fields[0], month: fields[1], day: fields[2] })
  })

  it.each([
    [[10, 22, 30, null], '102230', '10:22:30'],
    [[10, 22, null, null], '1022', '10:22'],
    [[10, null, null, null], '10', '10'],
    [[null, 22, 30, null], '-2230', '-22:30'],
    [[null, 22, null, null], '-22', '-22'],
    [[null, null, 30, null], '--30', '--30'],
    [[10, 22, 30, 0], '102230Z', '10:22:30Z'],
    [[10, 22, 30, -300], '102230-0500', '10:22:30-05:00'],
    [[10, 22, 30, 330], '102230+0530', '10:22:30+05:30'],
    [[null, null, null, null], '', ''],
  ] as const)('formats the time %j as %s in 4.0 and %s in 3.0', (fields, basic, extended) => {
    const value = new VPropertyTimeValue(...fields)
    const expected = { hour: fields[0], minute: fields[1], second: fields[2], offset: fields[3] }

    expect(value.serialize(VCardVersion.V4_0)).toBe(basic)
    expect(value.serialize(VCardVersion.V3_0)).toBe(extended)
    expect(new VPropertyTimeValue().deserialize(basic)).toMatchObject(expected)
    expect(new VPropertyTimeValue().deserialize(extended)).toMatchObject(expected)
  })

  it('refuses to format fields that have no valid form', () => {
    expect(() => new VPropertyDateValue(1985, null, 12).serialize()).toThrow('must also have a month')
    expect(() => new VPropertyTimeValue(10, null, 30).serialize()).toThrow('must also have a minute')
    expect(() => new VPropertyTimestampValue(1985, 4, 12).serialize()).toThrow('every field')
    expect(new VPropertyTimestampValue().serialize()).toBe('')
  })

  it('adds a T to a time-only value so it re-parses as a time', () => {
    const created = card('4.0', 'BDAY:--0412')
    created.drop('BDAY')
    // `add` is typed for string values only, so a typed property needs a cast for now.
    created.add(new VPropertyTemporalType('BDAY', new VPropertyTimeValue(10, 22)) as never)

    const output = serialize(created)
    expect(output).toContain('BDAY:T1022\r\n')
    expect(deserializeCard(output).birthDay?.value).toBeInstanceOf(VPropertyTimeValue)
  })

  it('leaves out the T when the property declares VALUE=time', () => {
    const input = card('4.0', 'BDAY;VALUE=time:1022')

    expect(serialize(input)).toContain('BDAY;VALUE=time:1022\r\n')
    expect(deserializeCard(serialize(input)).birthDay?.value).toBeInstanceOf(VPropertyTimeValue)
  })

  it.each([
    ['4.0', VCardVersion.V3_0, 'BDAY:19850412', 'BDAY:1985-04-12'],
    ['4.0', VCardVersion.V3_0, 'BDAY:--0412', 'BDAY:--04-12'],
    ['4.0', VCardVersion.V3_0, 'REV:19951031T222710Z', 'REV:1995-10-31T22:27:10Z'],
    ['4.0', VCardVersion.V3_0, 'ANNIVERSARY:20090808T1430-0500', 'ANNIVERSARY:2009-08-08T14:30-05:00'],
    ['3.0', VCardVersion.V4_0, 'BDAY:1985-04-12', 'BDAY:19850412'],
    ['3.0', VCardVersion.V4_0, 'REV:1995-10-31T22:27:10Z', 'REV:19951031T222710Z'],
  ] as const)('converting %s to %s rewrites %s', (from, to, line, expected) => {
    const converted = card(from, line)
    converted.version = to

    expect(serialize(converted)).toContain(`${expected}\r\n`)
  })

  it('keeps the original text when the version is set to the same value', () => {
    const unchanged = card('4.0', 'BDAY:1985-04-12')
    unchanged.version = VCardVersion.V4_0

    expect(serialize(unchanged)).toContain('BDAY:1985-04-12\r\n')
  })

  it('does not keep text containing a line break', () => {
    const value = new VPropertyDateValue().deserialize('1985\rEMAIL:evil@example.com')

    expect(value.source).toBeNull()
    expect(value.serialize()).toBe('')

    const property = new VPropertyTemporalType('BDAY', '1985\nEMAIL:evil@example.com')
    expect(serialize({ version: VCardVersion.V4_0, properties: [property as never] })).not.toContain('evil')
  })
})
