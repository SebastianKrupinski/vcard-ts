import { describe, expect, it } from 'vitest'

import { knownProperties } from '../src/properties/VPropertyTypes'
import { VPropertyBase } from '../src/properties/VPropertyBase'
import { VPropertyUriType } from '../src/properties/VPropertyUriType'

const IANA_PROPERTIES = [
  'SOURCE', 'KIND', 'XML', 'FN', 'N', 'NICKNAME', 'PHOTO', 'BDAY',
  'ANNIVERSARY', 'GENDER', 'ADR', 'TEL', 'EMAIL', 'IMPP', 'LANG', 'TZ',
  'GEO', 'TITLE', 'ROLE', 'LOGO', 'ORG', 'MEMBER', 'RELATED', 'CATEGORIES',
  'NOTE', 'PRODID', 'REV', 'SOUND', 'UID', 'CLIENTPIDMAP', 'URL', 'VERSION',
  'KEY', 'FBURL', 'CALADRURI', 'CALURI', 'BIRTHPLACE', 'DEATHPLACE',
  'DEATHDATE', 'EXPERTISE', 'HOBBY', 'INTEREST', 'ORG-DIRECTORY',
  'CONTACT-URI', 'CREATED', 'GRAMGENDER', 'LANGUAGE', 'PRONOUNS',
  'SOCIALPROFILE', 'JSPROP',
] as const

const VCARD_3_ONLY_PROPERTIES = [
  'NAME', 'PROFILE', 'LABEL', 'MAILER', 'AGENT', 'SORT-STRING', 'CLASS',
] as const

describe('property registry', () => {
  it('contains every property in the current IANA registry', () => {
    expect(Object.keys(knownProperties))
      .toEqual(expect.arrayContaining([...IANA_PROPERTIES]))
  })

  it('contains properties exclusive to vCard 3.0', () => {
    expect(Object.keys(knownProperties))
      .toEqual(expect.arrayContaining([...VCARD_3_ONLY_PROPERTIES]))
  })

  it('uses generic properties when no matching value type exists', () => {
    expect(knownProperties.CLIENTPIDMAP).toBe(VPropertyBase)
    expect(knownProperties.CREATED).toBe(VPropertyBase)
    expect(knownProperties.SOCIALPROFILE).toBe(VPropertyBase)
    expect(knownProperties.AGENT).toBe(VPropertyBase)
  })

  it('uses URI properties for registered URI values', () => {
    for (const name of [
      'SOURCE', 'LOGO', 'MEMBER', 'SOUND', 'FBURL', 'CALADRURI', 'CALURI',
      'ORG-DIRECTORY', 'CONTACT-URI',
    ]) {
      expect(knownProperties[name]).toBe(VPropertyUriType)
    }
  })
})
