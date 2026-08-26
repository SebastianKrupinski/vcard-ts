import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'

describe('AGENT properties', () => {
  it('round-trips an inline vCard as escaped text', () => {
    const line = 'AGENT:BEGIN:VCARD\\nFN:Susan Thomas\\nTEL:+1-919-555-1234\\nEND:VCARD\\n'
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      line,
      'END:VCARD',
    ].join('\r\n'))
    const agent = card.first('AGENT')

    expect(agent).toBeInstanceOf(VPropertyTextType)
    expect(agent?.value).toBe([
      'BEGIN:VCARD',
      'FN:Susan Thomas',
      'TEL:+1-919-555-1234',
      'END:VCARD',
      '',
    ].join('\n'))
    expect(serialize(card)).toContain(`${line}\r\n`)
  })

  it('keeps explicit URI agents as text', () => {
    const line = 'AGENT;VALUE=uri:https://example.com/susan.vcf'
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      line,
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('AGENT')).toBeInstanceOf(VPropertyTextType)
    expect(card.first('AGENT')?.value).toBe('https://example.com/susan.vcf')
    expect(serialize(card)).toContain(`${line}\r\n`)
  })
})
