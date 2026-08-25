import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'
import { VPropertyAddressType } from '../src/properties/VPropertyAddressType'
import { VPropertyDateValue } from '../src/properties/VPropertyDateValue'
import { VPropertyNameType } from '../src/properties/VPropertyNameType'
import { VPropertyOrganizationType } from '../src/properties/VPropertyOrganizationType'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'
import { VPropertyUriType } from '../src/properties/VPropertyUriType'

const CARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:Dr. Jane Doe',
  'N:Doe;Jane;Quinn;Dr.;PhD',
  'ADR:;;123 Main St;Toronto;ON;M5V 1A1;Canada',
  'ORG:Acme;Research',
  'BDAY:1990-05-02',
  'TEL:tel:+14165550123',
  'URL:https://example.com/profile',
  'X-CUSTOM:custom value',
  'END:VCARD',
].join('\r\n')

describe('property deserialization', () => {
  it('creates the registered property classes', () => {
    const card = deserializeCard(CARD)

    expect(card.formattedName).toBeInstanceOf(VPropertyTextType)
    expect(card.name).toBeInstanceOf(VPropertyNameType)
    expect(card.addresses).toEqual([expect.any(VPropertyAddressType)])
    expect(card.telephones).toEqual([expect.any(VPropertyUriType)])
    expect(card.fetch('ORG')).toBeInstanceOf(VPropertyOrganizationType)
    expect(card.fetch('URL')).toBeInstanceOf(VPropertyUriType)
  })

  it('deserializes structured name and address values', () => {
    const card = deserializeCard(CARD)
    const name = card.name?.value
    const address = card.fetch('ADR')

    expect(name).toMatchObject({
      family: 'Doe',
      given: 'Jane',
      additional: 'Quinn',
      prefix: 'Dr.',
      suffix: 'PhD',
    })

    expect(address).not.toBeNull()
    expect(Array.isArray(address)).toBe(false)
    if (!(address instanceof VPropertyAddressType)) return

    expect(address.value).toMatchObject({
      street: '123 Main St',
      locality: 'Toronto',
      region: 'ON',
    })
  })

  it('deserializes temporal values according to their detected type', () => {
    const birthday = deserializeCard(CARD).birthDay?.value

    expect(birthday).toBeInstanceOf(VPropertyDateValue)
    expect(birthday).toMatchObject({ year: 1990, month: 5, day: 2 })
  })

  it('preserves unknown extensions as generic properties', () => {
    const custom = deserializeCard(CARD).fetch('X-CUSTOM')

    expect(custom).toBeInstanceOf(VPropertyBase)
    expect(custom?.constructor).toBe(VPropertyBase)
    expect(Array.isArray(custom) ? null : custom?.value).toBe('custom value')
  })
})
