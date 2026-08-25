import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'

describe('parameter deserialization', () => {
  it('extracts multiple parameters from a property', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'EMAIL;TYPE=WORK;PREF=1:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    const email = card.first('EMAIL')

    expect(email).not.toBeNull()
    if (!email) return

    expect(email.params.TYPE).toEqual({ name: 'TYPE', value: 'WORK' })
    expect(email.params.PREF).toEqual({ name: 'PREF', value: '1' })
    expect(email.hasParams).toBe(true)
  })

  it('extracts a property group independently of its parameters', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'item1.EMAIL;TYPE=HOME:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    const email = card.first('EMAIL')

    expect(email).not.toBeNull()
    if (!email) return

    expect(email.group).toBe('item1')
    expect(email.hasGroup).toBe(true)
    expect(email.params.TYPE?.value).toBe('HOME')
  })

  it('recognizes a one-character property group', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'a.EMAIL:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('EMAIL')?.group).toBe('a')
  })

  it('leaves the parameter collection empty when none are present', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.formattedName?.params).toEqual({})
    expect(card.formattedName?.hasParams).toBe(false)
  })

  it('normalizes parameter names and removes surrounding quotes', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'EMAIL;type="WORK,VOICE":jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('EMAIL')?.params.TYPE).toEqual({
      name: 'TYPE',
      value: 'WORK,VOICE',
    })
  })

  it('rejects a malformed parameter instead of corrupting the value', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'EMAIL;TYPE:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))).toThrow('Invalid property parameter')
  })
})
