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
  'IMPP:xmpp:jane@example.com',
  'LANG:en',
  'LANG:fr',
  'TZ:America/Toronto',
  'GEO:geo:43.6532,-79.3832',
  'CATEGORIES:Friend,Work',
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
    expect(card.instantMessaging[0]?.value).toMatchObject({
      scheme: 'xmpp',
      reference: 'jane@example.com',
    })
    expect(card.languages.map(property => property.value)).toEqual(['en', 'fr'])
    expect(card.timeZones[0]?.value).toBe('America/Toronto')
    expect(card.geoLocations[0]?.value).toMatchObject({
      latitude: 43.6532,
      longitude: -79.3832,
    })
    expect(card.categories[0]?.value).toEqual(['Friend', 'Work'])
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
    expect(card.instantMessaging).toEqual([])
    expect(card.languages).toEqual([])
    expect(card.timeZones).toEqual([])
    expect(card.geoLocations).toEqual([])
    expect(card.categories).toEqual([])
  })
})
