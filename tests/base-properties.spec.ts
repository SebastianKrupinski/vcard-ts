import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyBase } from '../src/properties/VPropertyBase'

describe('base properties', () => {
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
