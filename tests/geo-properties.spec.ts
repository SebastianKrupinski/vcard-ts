import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyGeoType } from '../src/properties/VPropertyGeoType'
import { VPropertyUriGeoValue } from '../src/properties/VPropertyUriGeoValue'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('geographic properties', () => {
  it.each([
    'geo:46.772673,-71.282945,10',
    'geo:46.772673,-71.282945;u=20',
    'GEO:46.7700,-71.2800,-10.50;crs=wgs84;u=20;label=a%20b',
  ])('preserves all components of %s through parsing and assignment', uri => {
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', `GEO:${uri}`, 'END:VCARD', ''].join('\r\n')
    const card = deserializeCard(source)
    expect(serialize(card)).toBe(source)

    const property = new VPropertyGeoType('GEO', 'geo:0,0')
    property.value = uri
    expect(serializeProperty(property)).toBe(`GEO:${uri}`)
  })

  it('keeps altitude and URI parameters when coordinates are edited', () => {
    const value = new VPropertyUriGeoValue().deserialize('geo:46.7,-71.2,10;u=20')
    value.latitude = 45
    expect(value.serialize()).toBe('geo:45,-71.2,10;u=20')
    value.longitude = -72
    expect(value.serialize()).toBe('geo:45,-72,10;u=20')
  })

  it('resets preserved components when the same value is deserialized again', () => {
    const value = new VPropertyUriGeoValue().deserialize('geo:46.7,-71.2,10;u=20')
    value.deserialize('geo:1,2')
    value.latitude = 3
    expect(value.serialize()).toBe('geo:3,2')
    value.uri = false
    expect(value.serialize()).toBe('3;2')
  })

  it('retains non-geo URIs as ordinary URI values', () => {
    const uri = 'https://example.com/map?lat=46.7&lon=-71.2'
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', `GEO:${uri}`, 'END:VCARD', ''].join('\r\n')
    const card = deserializeCard(source)
    expect(card.geoLocations[0].value).toBeInstanceOf(VPropertyUriValue)
    expect(card.geoLocations[0].value).not.toBeInstanceOf(VPropertyUriGeoValue)
    expect(serialize(card)).toBe(source)

    const property = new VPropertyGeoType('GEO', uri)
    expect(serializeProperty(property)).toBe(`GEO:${uri}`)
    property.value = 'geo:1,2'
    expect(property.value).toBeInstanceOf(VPropertyUriGeoValue)
    property.value = uri
    expect(serializeProperty(property)).toBe(`GEO:${uri}`)
  })

  it.each(['not-a-geo', 'geo:bad,2', 'geo:1,', '1;bad'])('rejects malformed coordinates %s', value => {
    expect(() => new VPropertyGeoType('GEO', value)).toThrow('Invalid geographic value')
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', `GEO:${value}`, 'END:VCARD'].join('\r\n')
    expect(() => deserializeCard(source)).toThrow('Invalid geographic value')
  })

  it.each([
    ['3.0', '37.386013;-122.082932'],
    ['4.0', 'geo:37.386013,-122.082932'],
  ])('deserializes and serializes vCard %s coordinates', (version, value) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      `VERSION:${version}`,
      'FN:Toronto',
      'N:Toronto;;;;',
      `GEO:${value}`,
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('GEO')).toBeInstanceOf(VPropertyGeoType)
    expect(card.first('GEO')?.value).toMatchObject({
      latitude: 37.386013,
      longitude: -122.082932,
    })
    expect(serialize(card)).toContain(`GEO:${value}\r\n`)
  })
})
