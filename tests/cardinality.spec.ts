import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'

function v4Card(...properties: string[]): string {
  return [
    'BEGIN:VCARD',
    'VERSION:4.0',
    'FN:Jane Doe',
    ...properties,
    'END:VCARD',
  ].join('\r\n')
}

describe('property cardinality', () => {
  it.each([
    ['KIND', 'individual'],
    ['N', 'Doe;Jane;;;'],
    ['BDAY', '19900101'],
    ['ANNIVERSARY', '20200101'],
    ['GENDER', 'F'],
    ['PRODID', '-//Example//vCard TS//EN'],
    ['REV', '20200101T000000Z'],
    ['UID', 'urn:uuid:12345678-1234-1234-1234-123456789abc'],
    ['BIRTHPLACE', 'Toronto'],
    ['DEATHPLACE', 'Montreal'],
    ['DEATHDATE', '20500101'],
    ['CREATED', '20200101T000000Z'],
    ['LANGUAGE', 'en'],
  ])('rejects multiple logical %s properties in vCard 4.0', (name, value) => {
    expect(() => deserializeCard(v4Card(
      `${name}:${value}`,
      `${name}:${value}`,
    ))).toThrow(`expected at most 1 ${name} property, found 2`)
  })

  it('rejects multiple N properties in vCard 3.0', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'N:Doe;Janet;;;',
      'END:VCARD',
    ].join('\r\n'))).toThrow('expected exactly 1 N property, found 2')
  })

  it('allows vCard 4.0 singleton alternatives with the same ALTID', () => {
    const card = deserializeCard(v4Card(
      'N;ALTID=1;LANGUAGE=en:Doe;Jane;;;',
      'N;ALTID=1;LANGUAGE=fr:Doe;Jeanne;;;',
    ))

    expect(card.all('N')).toHaveLength(2)
  })

  it('allows repeatable properties and formatted names', () => {
    const card = deserializeCard(v4Card(
      'FN:Jane Q. Doe',
      'EMAIL:jane@example.com',
      'EMAIL:jane.doe@example.com',
    ))

    expect(card.all('FN')).toHaveLength(2)
    expect(card.emails).toHaveLength(2)
  })
})
