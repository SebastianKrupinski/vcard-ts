import { describe, expect, it } from 'vitest'
import {
  deserializeCard, serializeProperty, VPropertyAddressType, VPropertyAddressValue, VPropertyBase,
  VPropertyBinaryValue,
  VPropertyDateValue, VPropertyGeoType, VPropertyMediaType, VPropertyNameType, VPropertyNameValue,
  VPropertyStringCollectionType, VPropertyTemporalType, VPropertyTextOrUriType, VPropertyTextType,
  VPropertyTimeValue, VPropertyTimeZoneType, VPropertyUriDataValue, VPropertyUriOrTextType,
  VPropertyUriType, VPropertyUriValue, VPropertyUtcOffsetValue,
} from '../src'

const parse = (line: string) =>
  deserializeCard(`BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane\r\n${line}\r\nEND:VCARD`)
const reparse = (line: string, name: string) => parse(line).first(name)!

describe('value assignment', () => {
  describe('strings keep the property type', () => {
    it('keeps a replaced URL as a URI without text escaping', () => {
      const card = parse('URL:https://example.com')
      card.urls[0].value = 'https://example.com/a,b;c'
      expect(card.urls[0].value).toBeInstanceOf(VPropertyUriValue)
      expect(serializeProperty(card.urls[0])).toBe('URL:https://example.com/a,b;c')
      expect(card.urls[0].type).toBe('URI')
    })

    it('recognizes data URIs', () => {
      const card = parse('URL:https://example.com')
      card.urls[0].value = 'data:text/plain;base64,AAAA'
      expect(card.urls[0].value).toBeInstanceOf(VPropertyUriDataValue)
      const photo = new VPropertyMediaType('PHOTO', 'https://example.com/a.png')
      photo.value = 'data:image/png;base64,AAAA'
      expect(photo.value).toBeInstanceOf(VPropertyUriDataValue)
      expect(serializeProperty(photo)).toBe('PHOTO:data:image/png;base64,AAAA')
    })

    it('writes a URI without a scheme unchanged', () => {
      expect(serializeProperty(new VPropertyUriOrTextType('UID', 'plain-id'))).toBe('UID:plain-id')
      expect(serializeProperty(parse('UID:plain-id').uid!)).toBe('UID:plain-id')
      const uid = new VPropertyUriOrTextType('UID', 'urn:uuid:a')
      uid.value = 'plain-id'
      expect(serializeProperty(uid)).toBe('UID:plain-id')
    })

    it('keeps binary media declared by its encoding alone', () => {
      const photo = deserializeCard(
        'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:J\r\nN:D;J;;;\r\nPHOTO;ENCODING=b;TYPE=JPEG:AAAA\r\nEND:VCARD',
      ).photos[0]
      photo.value = 'BBBB'
      expect(serializeProperty(photo)).toBe('PHOTO;ENCODING=b;TYPE=JPEG:BBBB')
      expect(serializeProperty(new VPropertyMediaType('PHOTO', new VPropertyBinaryValue('AAAA'))))
        .toBe('PHOTO;VALUE=BINARY:AAAA')
    })

    it('follows the default or declared form of URI or text properties', () => {
      const uid = new VPropertyUriOrTextType('UID', 'urn:uuid:a')
      uid.value = 'urn:uuid:b'
      expect(uid.value).toBeInstanceOf(VPropertyUriValue)
      expect(serializeProperty(uid)).toBe('UID:urn:uuid:b')

      const declaredText = parse('UID;VALUE=text:a').uid!
      declaredText.value = 'one, two'
      expect(declaredText.value).toBe('one, two')
      expect(serializeProperty(declaredText)).toBe('UID;VALUE=text:one\\, two')

      const tel = new VPropertyTextOrUriType('TEL', '+1 555')
      tel.value = '+1 666'
      expect(tel.value).toBe('+1 666')
      expect(serializeProperty(tel)).toBe('TEL:+1 666')

      const declaredUri = parse('TEL;VALUE=uri:tel:+1').telephones[0]
      declaredUri.value = 'tel:+2'
      expect(declaredUri.value).toBeInstanceOf(VPropertyUriValue)
      expect(serializeProperty(declaredUri)).toBe('TEL;VALUE=uri:tel:+2')
    })

    it('recognizes time zone forms', () => {
      const zone = new VPropertyTimeZoneType('TZ', 'America/Toronto')
      zone.value = '-05:00'
      expect(zone.value).toBeInstanceOf(VPropertyUtcOffsetValue)
      expect(serializeProperty(zone)).toBe('TZ;VALUE=UTC-OFFSET:-05:00')
      zone.value = '+0100'
      expect(zone.value).toBeInstanceOf(VPropertyUtcOffsetValue)
      zone.value = 'America/Vancouver'
      expect(zone.value).toBe('America/Vancouver')
      expect(serializeProperty(zone)).toBe('TZ:America/Vancouver')
    })

    it('recognizes temporal forms and honours declared text', () => {
      const birthday = new VPropertyTemporalType('BDAY', '19850412')
      birthday.value = '19900101'
      expect(birthday.value).toBeInstanceOf(VPropertyDateValue)
      expect(serializeProperty(birthday)).toBe('BDAY:19900101')

      const text = parse('BDAY;VALUE=text:circa 1800').birthDay!
      text.value = 'circa 1900'
      expect(text.value).toBe('circa 1900')
      expect(serializeProperty(text)).toBe('BDAY;VALUE=text:circa 1900')
    })

    it('can switch form by setting the type first', () => {
      const birthday = new VPropertyTemporalType('BDAY', '19850412')
      birthday.type = 'text'
      birthday.value = 'circa 1800'
      expect(birthday.value).toBe('circa 1800')
      expect(serializeProperty(birthday)).toBe('BDAY;VALUE=text:circa 1800')
    })

    it('parses strings for structured properties in both paths', () => {
      const name = new VPropertyNameType('N', 'Doe;Jane;;;')
      name.value = 'Smith;John;;;'
      expect(name.value).toBeInstanceOf(VPropertyNameValue)
      expect(name.value?.family).toBe('Smith')
      expect(serializeProperty(name)).toBe('N:Smith;John;;;')

      const address = new VPropertyAddressType('ADR')
      address.value = ';;1 Main St;;;;'
      expect(address.value).toBeInstanceOf(VPropertyAddressValue)
      expect(address.value?.street).toBe('1 Main St')
    })

    it('stores an assigned list property string as one item', () => {
      const categories = new VPropertyStringCollectionType('CATEGORIES', 'a,b')
      expect(categories.value).toEqual(['a,b'])
      categories.value = 'c,d'
      expect(categories.value).toEqual(['c,d'])
      expect(serializeProperty(categories)).toBe('CATEGORIES:c\\,d')
      categories.value = ['e', 'f']
      expect(serializeProperty(categories)).toBe('CATEGORIES:e,f')
    })
  })

  describe('VALUE', () => {
    it('is not added when replacing text or structured values', () => {
      const note = parse('NOTE:a').notes[0]
      note.value = 'b'
      expect(serializeProperty(note)).toBe('NOTE:b')

      const name = parse('N:Doe;Jane;;;').name!
      name.value = new VPropertyNameValue('Smith')
      expect(serializeProperty(name)).toBe('N:Smith;;;;')

      const geo = new VPropertyGeoType('GEO', 'geo:1,2')
      geo.value = geo.value
      expect(serializeProperty(geo)).toBe('GEO:geo:1,2')
    })

    it('is kept as written while it still matches', () => {
      const url = parse('URL;VALUE=uri:https://a.example').urls[0]
      url.value = 'https://b.example'
      expect(serializeProperty(url)).toBe('URL;VALUE=uri:https://b.example')
    })

    it('is added when the value is not what the property implies', () => {
      const tel = new VPropertyTextOrUriType('TEL', new VPropertyUriValue('tel', '+1'))
      expect(serializeProperty(tel)).toBe('TEL;VALUE=URI:tel:+1')
      expect(reparse(serializeProperty(tel), 'TEL').value).toBeInstanceOf(VPropertyUriValue)

      const zone = new VPropertyTimeZoneType('TZ', new VPropertyUriValue('https', '//a.example'))
      expect(serializeProperty(zone)).toBe('TZ;VALUE=URI:https://a.example')
    })

    it('is corrected or removed when the value changes type', () => {
      const tel = new VPropertyTextOrUriType('TEL', new VPropertyUriValue('tel', '+1'))
      tel.value = new VPropertyUriValue('tel', '+2')
      expect(serializeProperty(tel)).toBe('TEL;VALUE=URI:tel:+2')
      tel.type = 'text'
      tel.value = '+3'
      expect(serializeProperty(tel)).toBe('TEL;VALUE=text:+3')

      const uid = parse('UID;VALUE=text:a').uid!
      uid.value = new VPropertyUriValue('urn', 'uuid:b')
      expect(serializeProperty(uid)).toBe('UID:urn:uuid:b')

      const birthday = parse('BDAY;VALUE=date:19850412').birthDay!
      birthday.value = new VPropertyTimeValue(10, 22)
      expect(serializeProperty(birthday)).toBe('BDAY:T1022')
    })

    it('is the same from the constructor and from assignment', () => {
      const value = new VPropertyUriValue('https', '//a.example')
      const assigned = new VPropertyBase<VPropertyUriValue>('X-A')
      assigned.value = value
      const constructed = new VPropertyBase('X-A', value)
      expect(serializeProperty(constructed)).toBe('X-A;VALUE=URI:https://a.example')
      expect(serializeProperty(assigned)).toBe(serializeProperty(constructed))
      expect(constructed.type).toBe('URI')
      expect(assigned.type).toBe('URI')
    })

    it('is removed with the value', () => {
      const uid = parse('UID;VALUE=text:a').uid!
      uid.value = null
      expect(uid.hasValue).toBe(false)
      expect(uid.params.VALUE).toBeUndefined()
      expect(uid.type).toBe('')
    })
  })

  it('reports the type of a value without a VALUE parameter', () => {
    expect(new VPropertyTextType('NOTE', 'a').type).toBe('TEXT')
    expect(new VPropertyStringCollectionType('CATEGORIES', ['a']).type).toBe('TEXT')
    expect(new VPropertyUriType('URL', 'https://a.example').type).toBe('URI')
    expect(new VPropertyTemporalType('BDAY', '19850412').type).toBe('DATE')
    expect(new VPropertyTextType('NOTE').type).toBe('')
  })

  describe('application text', () => {
    const literal = String.raw`literal\ntext, with; marks \\ here`

    it.each([
      ['a text constructor', () => new VPropertyTextType('NOTE', literal)],
      ['a text assignment', () => {
        const note = new VPropertyTextType('NOTE')
        note.value = literal
        return note
      }],
    ])('is not decoded by %s', (_, build) => {
      const note = build()
      expect(note.value).toBe(literal)
      expect(reparse(serializeProperty(note), 'NOTE').value).toBe(literal)
    })

    it('is not decoded by any property that can hold text', () => {
      const text = { VALUE: { name: 'VALUE', value: 'text' } }
      expect(new VPropertyBase('X-A', literal).value).toBe(literal)
      expect(new VPropertyUriOrTextType('UID', literal, null, text).value).toBe(literal)
      expect(new VPropertyTextOrUriType('TEL', literal).value).toBe(literal)
      expect(new VPropertyTimeZoneType('TZ', literal).value).toBe(literal)
      expect(new VPropertyTemporalType('BDAY', literal, null, { ...text }).value).toBe(literal)
      expect(new VPropertyStringCollectionType('CATEGORIES', literal).value).toEqual([literal])
    })

    it('keeps real newlines and commas through a round trip', () => {
      const note = new VPropertyTextType('NOTE', 'one\ntwo, three')
      expect(serializeProperty(note)).toBe('NOTE:one\\ntwo\\, three')
      expect(reparse(serializeProperty(note), 'NOTE').value).toBe('one\ntwo, three')
    })
  })

  describe('deserialize', () => {
    it('decodes encoded text explicitly', () => {
      expect(new VPropertyTextType('NOTE').deserialize('a\\,b\\nc').value).toBe('a,b\nc')
      expect(new VPropertyBase('X-A').deserialize('a\;b').value).toBe('a;b')
      expect(new VPropertyStringCollectionType('CATEGORIES').deserialize('a\\,b,c').value).toEqual(['a,b', 'c'])
      expect(new VPropertyTimeZoneType('TZ').deserialize('a\\,b').value).toBe('a,b')
    })

    it('leaves parameters as written', () => {
      const url = new VPropertyUriType('URL').deserialize('https://a.example')
      expect(url.value).toBeInstanceOf(VPropertyUriValue)
      expect(url.hasParams).toBe(false)
    })
  })
})
