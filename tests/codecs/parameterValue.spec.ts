import { describe, expect, it } from 'vitest'

import {
  decodeParameterValue,
  encodeParameterValue,
} from '../../src/codecs/parameterValue'

describe('parameter value codec', () => {
  it.each(['\r', '\r\n', '\n'])('normalizes and escapes newline %j', newline => {
    const encoded = encodeParameterValue(`one${newline}EMAIL:evil@example.com`)

    expect(encoded).toBe('one^nEMAIL:evil@example.com')
    expect(encoded).not.toMatch(/[\r\n]/)
    expect(decodeParameterValue(encoded)).toBe('one\nEMAIL:evil@example.com')
  })

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
