import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyUriType } from '../src/properties/VPropertyUriType'
import { VPropertyUriValue } from '../src/properties/VPropertyUriValue'

describe('URI properties', () => {
  it.each(['\r', '\n', '\r\n'])('rejects newline %j in an edited URI reference', newline => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nURL:https://example.com\r\nEND:VCARD')
    const property = card.first('URL')!
    const uri: unknown = property.value
    if (!(uri instanceof VPropertyUriValue)) throw new Error('Expected a URI value')
    uri.reference = `//example.com${newline}EMAIL:evil@example.com`

    expect(() => serializeProperty(property)).toThrow('Invalid property line: unescaped line break')
    expect(() => serialize(card)).toThrow('Invalid property line: unescaped line break')
  })

  it.each(['\r', '\n', '\r\n'])('rejects newline %j in a newly created URI', newline => {
    const property = new VPropertyUriType('URL', `https://example.com${newline}EMAIL:evil@example.com`)

    expect(() => serializeProperty(property)).toThrow('Invalid property line: unescaped line break')
  })

  it('preserves percent-encoded URI line breaks', () => {
    const property = new VPropertyUriType('URL', 'https://example.com/path%0D%0Avalue')

    expect(serializeProperty(property)).toBe('URL:https://example.com/path%0D%0Avalue')
  })

  it('preserves URI content after the first colon', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'URL:https://example.com:8443/profile',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('URL')?.value).toMatchObject({
      scheme: 'https',
      reference: '//example.com:8443/profile',
    })
  })

  it.each([
    ['SOURCE', 'https://directory.example.com/jane.vcf'],
    ['IMPP', 'xmpp:jane@example.com'],
    ['MEMBER', 'urn:uuid:03a0e51f-d1aa-4385-8a53-e29025acd8af'],
    ['URL', 'https://example.com/jane'],
    ['FBURL', 'https://example.com/jane.ifb'],
    ['CALADRURI', 'mailto:jane@example.com'],
    ['CALURI', 'https://example.com/jane.ics'],
    ['ORG-DIRECTORY', 'https://directory.example.com/acme'],
    ['CONTACT-URI', 'https://example.com/contact'],
  ])('deserializes and serializes the %s URI property', (name, value) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      `${name}:${value}`,
      'END:VCARD',
    ].join('\r\n'))
    const property = card.first(name)

    expect(property).toBeInstanceOf(VPropertyUriType)
    if (!(property instanceof VPropertyUriType)) return
    const uriValue = (property as unknown as VPropertyUriType).value
    expect(uriValue).toBeInstanceOf(VPropertyUriValue)
    if (!(uriValue instanceof VPropertyUriValue)) return
    expect(uriValue.serialize()).toBe(value)
    expect(serialize(card)).toContain(`${name}:${value}\r\n`)
  })
})
