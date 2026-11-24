import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  createCard, deserializeCard, serialize, VCard, VCardVersion, VPropertyTextType,
  type VCardInterface, type VPropertyBaseInterface,
} from '../src'

describe('read-only card properties', () => {
  it('prevents direct collection mutation in TypeScript and at runtime', () => {
    const card = createCard()
    card.add(new VPropertyTextType('FN', 'Jane'))
    const note = new VPropertyTextType('NOTE', 'Hello')

    expectTypeOf<VCardInterface['properties']>().toEqualTypeOf<readonly VPropertyBaseInterface[]>()
    expectTypeOf(card.properties).toEqualTypeOf<readonly VPropertyBaseInterface[]>()
    expect(() => {
      // @ts-expect-error Add properties through card.add().
      card.properties.push(note)
    }).toThrow(TypeError)
    expect(() => {
      // @ts-expect-error Replace properties through card.revise().
      card.properties[0] = note
    }).toThrow(TypeError)
    expect(() => {
      // @ts-expect-error Remove properties through card.drop().
      card.properties.splice(0, 1)
    }).toThrow(TypeError)
    expect(() => {
      // @ts-expect-error The collection itself cannot be replaced.
      card.properties = []
    }).toThrow(TypeError)
    expect(card.formattedName?.value).toBe('Jane')
    expect(card.properties).toHaveLength(1)
  })

  it('copies the constructor array so retained references cannot change the card', () => {
    const name = new VPropertyTextType('FN', 'Jane')
    const input = [name]
    const card = new VCard(VCardVersion.V4_0, input)
    input[0] = new VPropertyTextType('FN', 'Other')
    input.push(new VPropertyTextType('NOTE', 'Outside'))

    expect(card.properties).toEqual([name])
  })

  it('accepts a read-only constructor array and keeps card editing available', () => {
    const name = new VPropertyTextType('FN', 'Jane')
    const input = Object.freeze([name])
    const card = new VCard(VCardVersion.V4_0, input)
    const note = new VPropertyTextType('NOTE', 'Inside')
    card.add(note)

    expect(card.properties).toEqual([name, note])
    expect(input).toEqual([name])
  })

  it('returns immutable snapshots while edits go through card methods', () => {
    const card = createCard()
    const name = new VPropertyTextType('FN', 'Jane')
    card.add(name)
    const snapshot = card.properties
    const note = new VPropertyTextType('NOTE', 'Original')
    card.add(note)
    const revised = new VPropertyTextType('NOTE', 'Revised')
    card.revise(note, revised)
    card.reviseById(revised.id, note)
    expect(card.properties).toEqual([name, note])
    card.dropById(note.id)
    card.drop('FN')

    expect(card.properties).toEqual([])
    expect(snapshot).toEqual([name])
    expect(Object.isFrozen(snapshot)).toBe(true)
  })

  it('keeps property values editable and serialization available on parsed cards', () => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane\r\nEND:VCARD\r\n')
    expect(Object.isFrozen(card.properties)).toBe(true)
    card.formattedName!.value = 'Janet'
    expect(serialize(card)).toContain('FN:Janet\r\n')

    const copied = new VCard(card.version, card.properties)
    card.drop('FN')
    expect(copied.formattedName?.value).toBe('Janet')
  })
})
