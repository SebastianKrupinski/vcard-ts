import { describe, expect, it } from 'vitest'

import { deserializeCard } from '../src/VCard'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'

describe('text properties', () => {
  it('decodes escaped newlines', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'NOTE:Line one\\nLine two',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.formattedName).toBeInstanceOf(VPropertyTextType)
    expect(card.first('NOTE')?.value).toBe('Line one\nLine two')
  })
})
