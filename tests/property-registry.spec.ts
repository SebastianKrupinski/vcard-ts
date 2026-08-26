import { describe, expect, it } from 'vitest'

import { knownProperties } from '../src/properties/VPropertyTypes'
import { VPropertyClientPidMapType } from '../src/properties/VPropertyClientPidMapType'
import { VPropertyGeoType } from '../src/properties/VPropertyGeoType'
import { VPropertyMediaType } from '../src/properties/VPropertyMediaType'
import { VPropertyTemporalType } from '../src/properties/VPropertyTemporalType'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'
import { VPropertyTextOrUriType } from '../src/properties/VPropertyTextOrUriType'
import { VPropertyTimeZoneType } from '../src/properties/VPropertyTimeZoneType'
import { VPropertyUriOrTextType } from '../src/properties/VPropertyUriOrTextType'
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

  it('uses text for the vCard 3.0 agent property', () => {
    expect(knownProperties.AGENT).toBe(VPropertyTextType)
  })

  it('uses the structured client PID map property', () => {
    expect(knownProperties.CLIENTPIDMAP).toBe(VPropertyClientPidMapType)
  })

  it('uses mixed-value properties with their RFC default type', () => {
    for (const name of ['UID', 'RELATED', 'KEY', 'SOCIALPROFILE']) {
      expect(knownProperties[name]).toBe(VPropertyUriOrTextType)
    }
    for (const name of ['TEL', 'BIRTHPLACE', 'DEATHPLACE']) {
      expect(knownProperties[name]).toBe(VPropertyTextOrUriType)
    }
  })

  it('uses timestamp properties for timestamp values', () => {
    expect(knownProperties.REV).toBe(VPropertyTemporalType)
    expect(knownProperties.CREATED).toBe(VPropertyTemporalType)
  })

  it('uses the time zone property for text, URI, and UTC offset values', () => {
    expect(knownProperties.TZ).toBe(VPropertyTimeZoneType)
  })

  it('uses the geographic property for version-specific coordinates', () => {
    expect(knownProperties.GEO).toBe(VPropertyGeoType)
  })

  it('uses media properties for URI and inline binary values', () => {
    for (const name of ['PHOTO', 'LOGO', 'SOUND']) {
      expect(knownProperties[name]).toBe(VPropertyMediaType)
    }
  })

  it('uses URI properties for registered URI values', () => {
    for (const name of [
      'SOURCE', 'MEMBER', 'FBURL', 'CALADRURI', 'CALURI',
      'ORG-DIRECTORY', 'CONTACT-URI',
    ]) {
      expect(knownProperties[name]).toBe(VPropertyUriType)
    }
  })
})
