import { describe, expect, expectTypeOf, it } from 'vitest'
import * as api from '../src'
import {
  createCard, deserializeCard, serialize, serializeProperty, VCard, VCardVersion,
  VPropertyAddressType, VPropertyBase, VPropertyClientPidMapType,
  VPropertyCollection, VPropertyGenderType, VPropertyGeoType,
  VPropertyMediaType, VPropertyNameType, VPropertyNameValue,
  VPropertyOrganizationType, VPropertyStringCollectionType,
  VPropertyTemporalType, VPropertyTextOrUriType, VPropertyTextType,
  VPropertyTimeZoneType, VPropertyUriOrTextType, VPropertyUriType,
  VPropertyUriDataValue, VPropertyClientPidMapValue,
  type VPropertyBaseInterface, type VPropertyCollectionInterface,
  type VPropertyValueInterface,
  VPropertyValueBase,
} from '../src'

describe('typed construction', () => {
  it('makes every exported built-in value inherit from the shared base', () => {
    const valueClasses = Object.entries(api).filter(([name]) => /^VProperty.*Value$/.test(name))
    expect(valueClasses.length).toBeGreaterThan(0)
    for (const [, Value] of valueClasses) {
      expect(typeof Value).toBe('function')
      if (typeof Value === 'function') expect(Value.prototype).toBeInstanceOf(VPropertyValueBase)
    }
  })

  it('supports custom subclasses and narrowing through the shared base', () => {
    class CustomValue extends VPropertyValueBase {
      serialize(version: VCardVersion = VCardVersion.V4_0): string {
        return `custom-${version}`
      }
      type(): string { return 'TEXT' }
    }
    const card = createCard()
    card.add(new VPropertyBase('X-CUSTOM', new CustomValue()))
    const value = card.first('X-CUSTOM')?.value
    expect(value).toBeInstanceOf(VPropertyValueBase)
    if (value instanceof VPropertyValueBase) {
      expectTypeOf(value).toEqualTypeOf<VPropertyValueBase>()
      expect(value.type()).toBe('TEXT')
    }
    expect(serialize(card)).toContain('X-CUSTOM:custom-4.0\r\n')
    card.version = VCardVersion.V3_0
    expect(serialize(card)).toContain('X-CUSTOM:custom-3.0\r\n')
  })

  it('declares the wire types of data URIs and client PID maps', () => {
    const data = new VPropertyUriDataValue('AAAA', 'image/png', 'base64')
    const pidMap = new VPropertyClientPidMapValue().deserialize('1;urn:uuid:example')
    expectTypeOf(data).toExtend<VPropertyValueInterface>()
    expectTypeOf(pidMap).toExtend<VPropertyValueInterface>()
    expect(data.type()).toBe('URI')
    expect(pidMap.type()).toBe('TEXT')
    const card = createCard()
    card.add(new VPropertyMediaType('PHOTO', data))
    card.add(new VPropertyClientPidMapType('CLIENTPIDMAP', pidMap))
    expect(serialize(card)).toContain('PHOTO:data:image/png;base64,AAAA\r\n')
    expect(serialize(card)).toContain('CLIENTPIDMAP:1;urn:uuid:example\r\n')
  })

  it('rejects plain objects that only match the value interface', () => {
    const value = {
      serialize: (version: VCardVersion = VCardVersion.V4_0) => `custom-${version}`,
      type: () => 'TEXT',
    }
    expectTypeOf(value).toExtend<VPropertyValueInterface>()
    expectTypeOf(value).not.toExtend<VPropertyValueBase>()
    const card = createCard()
    // @ts-expect-error Custom values must extend VPropertyValueBase.
    card.add(new VPropertyBase('X-CUSTOM', value))
    expect(() => serialize(card)).toThrow('Invalid property value: X-CUSTOM')
  })

  it('accepts every property family in collections and card editing methods', () => {
    // This file is also checked by tsc: these public API calls must compile
    // without casts, including the constructors and both revision methods.
    const properties = [
      new VPropertyBase('X-CUSTOM', 'custom'),
      new VPropertyTextType('FN', 'Jane Doe'),
      new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Jane')),
      new VPropertyAddressType('ADR', ';;1 Main St;Toronto;ON;;Canada'),
      new VPropertyClientPidMapType('CLIENTPIDMAP', '1;urn:uuid:example'),
      new VPropertyGenderType('GENDER', 'F'),
      new VPropertyGeoType('GEO', 'geo:43.65,-79.38'),
      new VPropertyMediaType('PHOTO', 'https://example.com/photo.png'),
      new VPropertyOrganizationType('ORG', 'Example;Engineering'),
      new VPropertyStringCollectionType('CATEGORIES', ['work', 'friends']),
      new VPropertyTemporalType('BDAY', '20000102'),
      new VPropertyTextOrUriType('TEL', '+15551234567'),
      new VPropertyTimeZoneType('TZ', 'America/Toronto'),
      new VPropertyUriOrTextType('UID', 'urn:uuid:example'),
      new VPropertyUriType('URL', 'https://example.com'),
    ]
    const collection: VPropertyCollectionInterface = new VPropertyCollection(properties)
    const card = new VCard(VCardVersion.V4_0, collection)
    const editable = createCard()

    for (const property of properties) {
      const single = new VPropertyCollection(property)
      expect(single[0]).toBe(property)
      editable.add(property)
      editable.revise(property, property)
      editable.reviseById(property.id, property)
      expect(editable.findById(property.id)).toBe(property)
    }

    const parsed = deserializeCard(serialize(card))
    expect(parsed.name?.value?.given).toBe('Jane')
    expect(parsed.addresses[0]?.value?.locality).toBe('Toronto')
    expect(serializeProperty(parsed.urls[0])).toBe('URL:https://example.com')
    expect(parsed.categories[0]?.value).toEqual(['work', 'friends'])

    for (const property of properties) editable.drop(property)
    expect(editable.properties).toHaveLength(0)
  })

  it('supports structured replacements and direct collection construction', () => {
    const original = new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Jane'))
    const revised = new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Janet'))
    const card = new VCard(VCardVersion.V4_0, [original])
    card.revise(original, revised)
    expect(card.name).toBe(revised)
    card.reviseById(revised.id, original)
    expect(card.name).toBe(original)
    card.properties.push(new VPropertyUriType('URL', 'https://example.com'))
    expect(card.urls).toHaveLength(1)
  })

  it('retains concrete value types while generic access requires narrowing', () => {
    const name = new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Jane'))
    const card = createCard()
    card.add(name)
    expectTypeOf(name.value).toEqualTypeOf<VPropertyNameValue | null>()
    expectTypeOf(card.name?.value).toEqualTypeOf<VPropertyNameValue | null | undefined>()
    expectTypeOf(card.first('N')?.value).toEqualTypeOf<string | string[] | VPropertyValueBase | null | undefined>()
    expectTypeOf<VPropertyBase<number>>().not.toExtend<VPropertyBaseInterface>()
    expectTypeOf<VPropertyBaseInterface<string>['value']>().toEqualTypeOf<string | null>()
    expectTypeOf(new VPropertyTextType('FN', 'Jane').value).toEqualTypeOf<string | null>()
    expect(card.name?.value?.family).toBe('Doe')
  })

  it('uses the same value default for the property class and interface', () => {
    expectTypeOf<VPropertyBase['value']>().toEqualTypeOf<string | string[] | VPropertyValueBase | null>()
    expectTypeOf<VPropertyBaseInterface['value']>().toEqualTypeOf<string | string[] | VPropertyValueBase | null>()
    expectTypeOf<VPropertyBase>().toExtend<VPropertyBaseInterface>()
  })

  it('keeps generic values read-only while concrete properties stay writable', () => {
    const card = createCard()
    card.add(new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Jane')))
    const generic = card.first('N')!
    // @ts-expect-error The generic view can't guarantee that a string suits this property.
    const write = () => { generic.value = 'not a name' }
    expect(write).toBeTypeOf('function')
    expect(card.name?.value?.given).toBe('Jane')

    card.name!.value = new VPropertyNameValue('Doe', 'Janet')
    expect(card.name?.value?.given).toBe('Janet')
  })

  it('lets every property constructor forward a nullable group', () => {
    const group = null as string | null
    const properties = [
      new VPropertyBase('X-CUSTOM', 'custom', group),
      new VPropertyTextType('FN', 'Jane Doe', group),
      new VPropertyNameType('N', 'Doe;Jane;;;', group),
      new VPropertyAddressType('ADR', ';;1 Main St;;;;', group),
      new VPropertyClientPidMapType('CLIENTPIDMAP', '1;urn:uuid:example', group),
      new VPropertyGenderType('GENDER', 'F', group),
      new VPropertyGeoType('GEO', 'geo:43.65,-79.38', group),
      new VPropertyMediaType('PHOTO', 'https://example.com/photo.png', group),
      new VPropertyOrganizationType('ORG', 'Example', group),
      new VPropertyStringCollectionType('CATEGORIES', 'work', group),
      new VPropertyTemporalType('BDAY', '20000102', group),
      new VPropertyTextOrUriType('TEL', '+15551234567', group),
      new VPropertyTimeZoneType('TZ', 'America/Toronto', group),
      new VPropertyUriOrTextType('UID', 'urn:uuid:example', group),
      new VPropertyUriType('URL', 'https://example.com', group),
    ]
    for (const property of properties) expect(property.group).toBeNull()
  })

  it('allows a string collection to start without a value', () => {
    const property = new VPropertyStringCollectionType('NICKNAME')
    expect(property.hasValue).toBe(false)
    expect(property.group).toBeNull()
    expect(property.params).toEqual({})
  })
})
