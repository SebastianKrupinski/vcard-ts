import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyClientPidMapType } from '../src/properties/VPropertyClientPidMapType'
import { VPropertyClientPidMapValue } from '../src/properties/VPropertyClientPidMapValue'

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

  it('rejects non-positive source identifiers in the value model', () => {
    const value = new VPropertyClientPidMapValue().deserialize(
      '0;urn:uuid:3df403f4-5924-4bb7-b077-3c711d9eb34b',
    )

    expect(value.sourceId).toBeNull()
    expect(value.serialize()).toBe('')
  })
})
