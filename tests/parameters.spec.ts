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

    const email = card.fetch('EMAIL')

    expect(email).not.toBeNull()
    expect(Array.isArray(email)).toBe(false)
    if (!email || Array.isArray(email)) return

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

    const email = card.fetch('EMAIL')

    expect(email).not.toBeNull()
    expect(Array.isArray(email)).toBe(false)
    if (!email || Array.isArray(email)) return

    expect(email.group).toBe('item1')
    expect(email.hasGroup).toBe(true)
    expect(email.params.TYPE?.value).toBe('HOME')
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
})
