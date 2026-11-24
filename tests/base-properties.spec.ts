import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize, serializeProperty } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'

describe('base properties', () => {
  it.each(['uri', 'URI', 'uRi'])('preserves unknown properties declared as VALUE=%s', type => {
    const uri = 'https://example.com/a,b;c?one=1,2&two=3;4'
    const line = `item1.X-LINK;VALUE=${type}:${uri}`
    const source = ['BEGIN:VCARD', 'VERSION:4.0', 'FN:Jane', line, 'END:VCARD', ''].join('\r\n')
    const card = deserializeCard(source)
    const property = card.first('X-LINK')!

    expect(property.constructor).toBe(VPropertyBase)
    expect(property.value).toBe(uri)
    expect(serialize(card)).toBe(source)

    const constructed = new VPropertyBase('X-LINK', uri, 'item1', {
      VALUE: { name: 'VALUE', value: type },
    })
    expect(serializeProperty(constructed)).toBe(line)

    const replacement = 'https://example.com/other,a;b'
    constructed.value = replacement
    expect(serializeProperty(constructed)).toBe(`item1.X-LINK;VALUE=${type}:${replacement}`)
    constructed.type = 'text'
    constructed.value = 'one,two;three'
    expect(serializeProperty(constructed)).toBe('item1.X-LINK;VALUE=text:one\\,two\\;three')
  })

  it('does not decode text escapes in a URI string', () => {
    const value = String.raw`https://example.com/a\nb\,c\;d`
    const property = new VPropertyBase<string>('X-LINK', undefined, null, {
      VALUE: { name: 'VALUE', value: 'uri' },
    }).deserialize(value)

    expect(property.value).toBe(value)
    expect(serializeProperty(property)).toBe(`X-LINK;VALUE=uri:${value}`)
  })

  it.each(['\r', '\n', '\r\n'])('rejects newline %j in a generic URI string', newline => {
    const property = new VPropertyBase('X-LINK', `https://example.com${newline}EMAIL:evil@example.com`, null, {
      VALUE: { name: 'VALUE', value: 'uri' },
    })

    expect(() => serializeProperty(property)).toThrow('Invalid property line: unescaped line break')
  })

  it('continues to escape generic text values', () => {
    for (const params of [undefined, { VALUE: { name: 'VALUE', value: 'text' } }]) {
      const property = new VPropertyBase('X-CUSTOM', 'one,two;three\nfour', null, params)
      const line = serializeProperty(property)
      expect(line).toBe(`X-CUSTOM${params ? ';VALUE=text' : ''}:one\\,two\\;three\\nfour`)
    }
  })

  it('preserves unknown extensions and literal backslashes', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'X-CUSTOM:custom value',
      'X-LITERAL:Literal\\\\n text',
      'END:VCARD',
    ].join('\r\n'))
    const custom = card.first('X-CUSTOM')

    expect(custom).toBeInstanceOf(VPropertyBase)
    expect(custom?.constructor).toBe(VPropertyBase)
    expect(custom?.value).toBe('custom value')
    expect(card.first('X-LITERAL')?.value).toBe('Literal\\n text')
  })
})
