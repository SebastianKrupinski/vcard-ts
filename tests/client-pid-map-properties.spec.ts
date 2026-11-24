import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyClientPidMapType } from '../src/properties/VPropertyClientPidMapType'
import { VPropertyClientPidMapValue } from '../src/properties/VPropertyClientPidMapValue'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('CLIENTPIDMAP properties', () => {
  it('exposes the source identifier and URI components', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'CLIENTPIDMAP:1;urn:uuid:3df403f4-5924-4bb7-b077-3c711d9eb34b',
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first('CLIENTPIDMAP')

    expect(property).toBeInstanceOf(VPropertyClientPidMapType)
    if (!(property instanceof VPropertyClientPidMapType)) return

    const clientPidMap = property as unknown as VPropertyClientPidMapType
    expect(clientPidMap.value).toBeInstanceOf(VPropertyClientPidMapValue)
    expect(clientPidMap.value?.sourceId).toBe(1)
    expect(clientPidMap.value?.uri?.scheme).toBe('urn')
    expect(clientPidMap.value?.uri?.reference)
      .toBe('uuid:3df403f4-5924-4bb7-b077-3c711d9eb34b')
  })

  it('round-trips multiple mappings and URI semicolons', () => {
    const source = [
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'CLIENTPIDMAP:1;urn:uuid:3df403f4-5924-4bb7-b077-3c711d9eb34b',
      'CLIENTPIDMAP:2;https://example.com/client;version=1',
      'END:VCARD',
    ].join('\r\n')
    const card = deserializeCard(source)

    expect(card.all('CLIENTPIDMAP')).toHaveLength(2)
    expect(serialize(card)).toBe(`${source}\r\n`)
  })

  it.each([
    '',
    'abc',
    ';urn:uuid:a',
    '0;urn:uuid:a',
    '-1;urn:uuid:a',
    '1.5;urn:uuid:a',
    '9007199254740992;urn:uuid:a',
    '1;',
    '1;relative-path',
    '1;https://example.com/a b',
  ])('rejects malformed mapping %j during parsing and assignment', mapping => {
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', `CLIENTPIDMAP:${mapping}`, 'END:VCARD'].join('\r\n')
    expect(() => deserializeCard(source)).toThrow('Invalid CLIENTPIDMAP value')
    expect(() => new VPropertyClientPidMapType('CLIENTPIDMAP', mapping)).toThrow('Invalid CLIENTPIDMAP value')

    const property = new VPropertyClientPidMapType('CLIENTPIDMAP', '1;urn:uuid:original')
    expect(() => { property.value = mapping }).toThrow('Invalid CLIENTPIDMAP value')
    expect(serializeProperty(property)).toBe('CLIENTPIDMAP:1;urn:uuid:original')
  })

  it('preserves leading zeroes until the source identifier is edited', () => {
    const value = new VPropertyClientPidMapValue().deserialize('001;urn:uuid:a')
    expect(value.sourceId).toBe(1)
    expect(value.serialize()).toBe('001;urn:uuid:a')

    value.sourceId = 2
    expect(value.serialize()).toBe('2;urn:uuid:a')
  })

  it('rejects a line break after the source identifier in the value model', () => {
    expect(() => new VPropertyClientPidMapValue().deserialize('1\n;urn:uuid:a'))
      .toThrow('Invalid CLIENTPIDMAP value')
  })

  it('does not clear a previously parsed mapping when deserialization fails', () => {
    const value = new VPropertyClientPidMapValue().deserialize('1;urn:uuid:a')
    expect(() => value.deserialize('bad')).toThrow('Invalid CLIENTPIDMAP value')
    expect(value.serialize()).toBe('1;urn:uuid:a')
  })

  it('rejects incomplete constructed mappings on serialization', () => {
    const value = new VPropertyClientPidMapValue()
    expect(() => value.serialize()).toThrow('Invalid CLIENTPIDMAP value')

    value.sourceId = 1
    expect(() => value.serialize()).toThrow('Invalid CLIENTPIDMAP value')
    value.uri = new VPropertyUriValue('urn', 'uuid:a')
    expect(value.serialize()).toBe('1;urn:uuid:a')

    value.sourceId = 0
    expect(() => serializeProperty(new VPropertyClientPidMapType('CLIENTPIDMAP', value)))
      .toThrow('Invalid CLIENTPIDMAP value')
  })

  it('rejects an edited URI with no scheme on serialization', () => {
    const value = new VPropertyClientPidMapValue().deserialize('1;urn:uuid:a')
    value.uri!.scheme = ''
    expect(() => value.serialize()).toThrow('Invalid CLIENTPIDMAP value')
  })
})
