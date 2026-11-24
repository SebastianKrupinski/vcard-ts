import { describe, expect, it } from 'vitest'
import { deserialize } from '../src'

const CARD = 'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nEND:VCARD'

describe('batch parsing', () => {
  it.each([
    ['CRLF', `${CARD}\r\n${CARD}\r\n`],
    ['LF', `${CARD}\n${CARD}\n`.replace(/\r\n/g, '\n')],
    ['blank lines between cards', `\r\n${CARD}\r\n\r\n  \r\n${CARD}\r\n\r\n`],
    ['a byte order mark', `﻿${CARD}\r\n${CARD}`],
    ['lowercase markers', `${CARD}\r\n${CARD.toLowerCase().replace('fn:jane doe', 'FN:Jane Doe').replace('version', 'VERSION')}`],
    ['trailing whitespace after END', `${CARD} \r\n${CARD}`],
  ])('reads every card with %s', (_, input) => {
    expect(deserialize(input)).toHaveLength(2)
  })

  it('reports an unfinished trailing card', () => {
    expect(() => deserialize(`${CARD}\r\nBEGIN:VCARD\r\nVERSION:4.0\r\nFN:Lost`))
      .toThrow('Invalid input data: card 2 at line 5 is missing END:VCARD')
  })

  it('reports an unfinished card followed by a complete one', () => {
    expect(() => deserialize(`BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Lost\r\n${CARD}`))
      .toThrow('Invalid input data: card 1 at line 1: Invalid vCard data: nested card marker')
  })

  it.each([
    ['after a card', `${CARD}\r\njunk`, 5],
    ['between cards', `${CARD}\r\njunk\r\n${CARD}`, 5],
    ['before a card', `junk\r\n${CARD}`, 1],
    ['as a folded end marker', `${CARD}\r\n junk`, 5],
    ['as a stray end marker', `${CARD}\r\nEND:VCARD`, 5],
  ])('reports content %s', (_, input, line) => {
    expect(() => deserialize(input))
      .toThrow(`Invalid input data: unexpected content outside a card at line ${line}`)
  })

  it('does not treat text after the end marker as the end of a card', () => {
    expect(() => deserialize(`BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nEND:VCARDjunk`))
      .toThrow('card 1 at line 1 is missing END:VCARD')
  })

  it('says which card failed and keeps the original error', () => {
    const invalid = 'BEGIN:VCARD\r\nVERSION:4.0\r\nNOTE:no name\r\nEND:VCARD'
    let error: unknown
    try {
      deserialize(`${CARD}\r\n${invalid}`)
    } catch (caught) {
      error = caught
    }
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(
      'Invalid input data: card 2 at line 5: Invalid vCard data: expected at least 1 FN property, found 0',
    )
    expect((error as Error).cause).toBeInstanceOf(Error)
  })
})
