import { describe, expect, it } from 'vitest'
import { deserializeCard, serialize, VPropertyAddressValue, VPropertyNameValue } from '../src'

const roundTrip = (property: string) => {
  const card = deserializeCard(`BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane\r\n${property}\r\nEND:VCARD`)
  return { card, output: serialize(deserializeCard(serialize(card))).replace(/\r\n /g, '') }
}

describe('structured values', () => {
  describe('component lists', () => {
    it('keeps separate items apart from an escaped comma', () => {
      const { card, output } = roundTrip('N:Doe;Jane,Janet;A\\,B;;')
      expect(card.name?.value?.getList('given')).toEqual(['Jane', 'Janet'])
      expect(card.name?.value?.getList('additional')).toEqual(['A,B'])
      expect(output).toContain('N:Doe;Jane,Janet;A\\,B;;\r\n')
    })

    it('reads the first item through single value accessors', () => {
      const name = new VPropertyNameValue().deserialize('Doe;Jane,Janet;;;')
      expect(name.given).toBe('Jane')
      name.given = 'June, Jr'
      expect(name.getList('given')).toEqual(['June, Jr'])
      expect(name.serialize()).toBe('Doe;June\\, Jr;;;')
    })

    it('accepts lists through constructors and list methods', () => {
      const name = new VPropertyNameValue('Doe', ['Jane', 'Janet'])
      name.setList('suffix', ['Jr.', 'M.D.'])
      expect(name.serialize()).toBe('Doe;Jane,Janet;;;Jr.,M.D.')
      name.getList('suffix').push('PhD')
      expect(name.suffix).toBe('Jr.')
      expect(name.serialize()).toBe('Doe;Jane,Janet;;;Jr.,M.D.,PhD')

      const address = new VPropertyAddressValue('', '', ['1 Main St', 'Floor 2'])
      expect(address.serialize()).toBe(';;1 Main St,Floor 2;;;;')
      expect(address.street).toBe('1 Main St')
    })

    it('checks field names when compiling and at runtime', () => {
      const name = new VPropertyNameValue()
      const address = new VPropertyAddressValue()
      expect(address.getList('direction')).toEqual([])
      // @ts-expect-error Streets belong to addresses, not names.
      expect(() => name.getList('street')).toThrow('Unknown structured value field: street')
      // @ts-expect-error Streets belong to addresses, not names.
      expect(() => name.setList('street', ['x'])).toThrow('Unknown structured value field: street')
    })

    it('replaces a list with text, or clears it with empty text', () => {
      const name = new VPropertyNameValue('Doe', ['Jane', 'Janet'])
      name.setList('given', 'June')
      expect(name.getList('given')).toEqual(['June'])
      name.setList('given', '')
      expect(name.getList('given')).toEqual([])
      name.setList('family', null)
      expect(name.getList('family')).toEqual([])
    })

    it('copies a list when replacing it', () => {
      const items = ['Jane']
      const name = new VPropertyNameValue()
      name.setList('given', items)
      items.push('Janet')
      expect(name.getList('given')).toEqual(['Jane'])
    })

    it('keeps empty items inside a list', () => {
      expect(roundTrip('N:Doe;a,,b;;;').output).toContain('N:Doe;a,,b;;;\r\n')
    })

    it('reports empty components as they did before', () => {
      const name = new VPropertyNameValue().deserialize('Doe;;;;')
      const address = new VPropertyAddressValue().deserialize(';;;;;;')
      expect(name.given).toBe('')
      expect(name.getList('given')).toEqual([])
      expect(address.street).toBeNull()
      expect(address.getList('street')).toEqual([])
      address.street = 'x'
      address.street = null
      expect(address.street).toBeNull()
    })
  })

  describe('RFC 9554 components', () => {
    it('exposes the secondary surname and generation in N', () => {
      const { card, output } = roundTrip('N:Stevenson;John;Philip,Paul;Dr.;Jr.,M.D.,A.C.P.;Smith;Jr.')
      const name = card.name!.value!
      expect(name.secondarySurname).toBe('Smith')
      expect(name.generation).toBe('Jr.')
      expect(name.getList('suffix')).toEqual(['Jr.', 'M.D.', 'A.C.P.'])
      expect(output).toContain('N:Stevenson;John;Philip,Paul;Dr.;Jr.,M.D.,A.C.P.;Smith;Jr.\r\n')
    })

    it('exposes every additional ADR component in order', () => {
      const source = ';;;;;;;room;apartment;floor;number;name;building;block;subdistrict;district;landmark;north'
      const { card, output } = roundTrip(`ADR:${source}`)
      const address = card.addresses[0].value!
      expect([
        address.room, address.apartment, address.floor, address.streetNumber, address.streetName,
        address.building, address.block, address.subdistrict, address.district, address.landmark,
        address.direction,
      ]).toEqual([
        'room', 'apartment', 'floor', 'number', 'name', 'building', 'block', 'subdistrict',
        'district', 'landmark', 'north',
      ])
      expect(output).toContain(`ADR:${source}\r\n`)
    })

    it('writes only as many components as a value uses', () => {
      const name = new VPropertyNameValue('Doe', 'Jane')
      expect(name.serialize()).toBe('Doe;Jane;;;')
      name.generation = 'II'
      expect(name.serialize()).toBe('Doe;Jane;;;;;II')
      name.generation = ''
      expect(name.serialize()).toBe('Doe;Jane;;;')

      const address = new VPropertyAddressValue()
      address.floor = '3'
      expect(address.serialize()).toBe(';;;;;;;;;3')
    })
  })

  it('keeps components beyond the known fields', () => {
    expect(roundTrip('N:a;b;c;d;e;f;g;h,i;;j').output).toContain('N:a;b;c;d;e;f;g;h,i;;j\r\n')
    const address = `ADR:${';'.repeat(18)}future`
    expect(roundTrip(address).output).toContain(`${address}\r\n`)
  })

  it('removes empty trailing components', () => {
    expect(roundTrip('N:Doe;Jane;;;;;;').output).toContain('N:Doe;Jane;;;\r\n')
    expect(roundTrip(`ADR:a${';'.repeat(17)}`).output).toContain('ADR:a;;;;;;\r\n')
  })
})
