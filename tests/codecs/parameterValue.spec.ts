import { describe, expect, it } from 'vitest'

import {
  decodeParameterValue,
  encodeParameterValue,
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
})
