import { describe, expect, it } from 'vitest'

import { foldContentLine, unfoldContentLines } from '../../src/codecs/contentLine'

const encoder = new TextEncoder()

describe('content line codec', () => {
  it('folds ASCII content lines after 75 bytes', () => {
    const folded = foldContentLine('A'.repeat(80))

    expect(folded).toBe(`${'A'.repeat(75)}\r\n ${'A'.repeat(5)}`)
  })

  it('does not split multibyte UTF-8 characters', () => {
    const folded = foldContentLine('🙂'.repeat(25))
    const physicalLines = folded.split('\r\n')

    expect(physicalLines).toHaveLength(2)
    expect(physicalLines.every(line => encoder.encode(line).length <= 75)).toBe(true)
    expect(folded.replace('\r\n ', '')).toBe('🙂'.repeat(25))
  })

  it('leaves short content lines unchanged', () => {
    expect(foldContentLine('FN:Jane Doe')).toBe('FN:Jane Doe')
  })

  it('unfolds space and tab continuations across newline styles', () => {
    expect(unfoldContentLines('NOTE:one\r\n two\r\tthree')).toEqual([
      'NOTE:onetwothree',
    ])
  })
})
