import { describe, expect, it } from 'vitest'

import {
  decodeParameterValue,
  encodeParameterValue,
  encodeParameters,
} from '../../src/codecs/parameterValue'

describe('parameter value codec', () => {
  it('encodes and decodes vCard caret escapes', () => {
    const value = 'Desk "A" ^ north\nSecond floor'
    const encoded = "Desk ^'A^' ^^ north^nSecond floor"

    expect(encodeParameterValue(value)).toBe(encoded)
    expect(decodeParameterValue(encoded)).toBe(value)
  })

  it('preserves unknown caret escapes', () => {
    expect(decodeParameterValue('Desk^xLabel')).toBe('Desk^xLabel')
  })

  it('encodes a complete parameter collection', () => {
    expect(encodeParameters({
      TYPE: { name: 'type', value: 'WORK,VOICE' },
      LABEL: { name: 'label', value: 'Desk, primary: north' },
      CN: { name: 'cn', value: 'Desk "A"' },
    })).toBe('TYPE=WORK,VOICE;LABEL="Desk, primary: north";CN=Desk ^\'A^\'')
  })
})
