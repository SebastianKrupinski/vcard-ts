import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'

const CARD = [
  'BEGIN:VCARD',
  'VERSION:4.0',
  'FN:Jane Doe',
  'NICKNAME:Jane,JD',
  'PHOTO:https://example.com/jane.jpg',
  'ORG:Example Inc.;Engineering',
  'TITLE:Senior Engineer',
  'ROLE:Developer',
  'NOTE:Primary contact',
  'URL:https://example.com/jane',
  'URL:https://social.example.com/jane',
  'END:VCARD',
].join('\r\n')

describe('card property getters', () => {
  it('exposes common repeatable properties through typed getters', () => {
    const card = deserializeCard(CARD)

    expect(card.nicknames[0]?.value).toEqual(['Jane', 'JD'])
    expect(card.photos[0]?.value?.serialize()).toBe('https://example.com/jane.jpg')
    expect(card.organizations[0]?.value).toMatchObject({
      name: 'Example Inc.',
      units: ['Engineering'],
    })
    expect(card.titles[0]?.value).toBe('Senior Engineer')
    expect(card.roles[0]?.value).toBe('Developer')
    expect(card.notes[0]?.value).toBe('Primary contact')
    expect(card.urls.map(property => property.value)).toMatchObject([
      { scheme: 'https', reference: '//example.com/jane' },
      { scheme: 'https', reference: '//social.example.com/jane' },
    ])
  })

  it('returns empty arrays when repeatable properties are absent', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.nicknames).toEqual([])
    expect(card.photos).toEqual([])
    expect(card.organizations).toEqual([])
    expect(card.titles).toEqual([])
    expect(card.roles).toEqual([])
    expect(card.notes).toEqual([])
    expect(card.urls).toEqual([])
  })
})
