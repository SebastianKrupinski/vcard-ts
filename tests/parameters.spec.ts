import { describe, expect, it } from 'vitest'
import { decodeParameters } from '../src/codecs/parameter'

import { deserializeCard, serialize } from '../src/VCard'
import { VParameterListObject, VParameterObject } from '../src/parameters/VParameterObject'
import { VPropertyTextType } from '../src/properties/VPropertyTextType'

function property(line: string) {
  const card = deserializeCard([
    'BEGIN:VCARD',
    'VERSION:4.0',
    'FN:Jane Doe',
    line,
    'END:VCARD',
  ].join('\r\n'))
  return card.properties.at(-1)!
}

describe('parameter deserialization', () => {
  it('extracts multiple parameters from a property', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'EMAIL;TYPE=WORK;PREF=1:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    const email = card.first('EMAIL')

    expect(email).not.toBeNull()
    if (!email) return

    expect(email.params.TYPE).toMatchObject({ name: 'TYPE', value: 'WORK', list: ['WORK'] })
    expect(email.params.PREF).toMatchObject({ name: 'PREF', value: '1' })
    expect(email.hasParams).toBe(true)
  })

  it('extracts a property group independently of its parameters', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'item1.EMAIL;TYPE=HOME:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    const email = card.first('EMAIL')

    expect(email).not.toBeNull()
    if (!email) return

    expect(email.group).toBe('item1')
    expect(email.hasGroup).toBe(true)
    expect(email.params.TYPE?.value).toBe('HOME')
  })

  it('recognizes a one-character property group', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'a.EMAIL:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('EMAIL')?.group).toBe('a')
  })

  it('leaves the parameter collection empty when none are present', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Jane Doe',
      'N:Doe;Jane;;;',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.formattedName?.params).toEqual({})
    expect(card.formattedName?.hasParams).toBe(false)
  })

  it('normalizes parameter names and removes surrounding quotes', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'EMAIL;type="WORK,VOICE":jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('EMAIL')?.params.TYPE).toMatchObject({
      name: 'TYPE',
      value: 'WORK,VOICE',
    })
  })

  it('rejects a malformed parameter instead of corrupting the value', () => {
    expect(() => deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'EMAIL;TYPE:jane@example.com',
      'END:VCARD',
    ].join('\r\n'))).toThrow('Invalid property parameter')
  })

  it('decodes vCard 4 caret escapes in parameter values', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'EMAIL;LABEL="Desk^\'s^^phone^nSecond line":jane@example.com',
      'END:VCARD',
    ].join('\r\n'))

    expect(card.first('EMAIL')?.params.LABEL?.value)
      .toBe('Desk"s^phone\nSecond line')
  })
})

describe('multiple parameter values', () => {
  it('preserves quoted commas across repeated list parameters and editing', () => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nTEL;TYPE="work,voice";TYPE=cell:+1\r\nEND:VCARD')
    const parameter = card.first('TEL')!.params.TYPE!

    expect(parameter.list).toEqual(['work,voice', 'cell'])
    expect(parameter.value).toBe('work,voice,cell')
    expect(parameter.source).toEqual(['"work,voice"', 'cell'])
    parameter.list = [...parameter.list, 'home']

    expect(parameter.source).toBeNull()
    const encoded = serialize(card)
    expect(encoded).toContain('TEL;TYPE="work,voice",cell,home:+1\r\n')
    expect(deserializeCard(encoded).first('TEL')!.params.TYPE?.list)
      .toEqual(['work,voice', 'cell', 'home'])
  })

  it.each([
    'TEL;TYPE=work;TYPE=voice:+1',
    'TEL;TYPE=work,voice:+1',
    'TEL;TYPE="work","voice":+1',
    'TEL;type=work;type=voice:+1',
  ])('reads every value and the property value from %s', line => {
    const tel = property(line)

    expect(tel.params.TYPE?.list).toEqual(['work', 'voice'])
    expect(tel.params.TYPE?.value).toBe('work,voice')
    expect(tel.value).toBe('+1')
  })

  it('treats a comma as part of the value outside list parameters', () => {
    expect(property('ADR;LABEL="1 Main St, Town":;;;;;;').params.LABEL?.value).toBe('1 Main St, Town')
    expect(property('NOTE;X-A=a,b:x').params['X-A']?.value).toBe('a,b')
    expect(property('NOTE;X-A="a","b":x').params['X-A']?.value).toBe('a,b')
  })

  it('keeps every occurrence of a repeated parameter outside list parameters', () => {
    expect(property('NOTE;X-A=a;X-A=b:x').params['X-A']?.value).toBe('a,b')
  })

  it('only offers a list on list parameters', () => {
    const note = property('NOTE;TYPE=work;LANGUAGE=en;X-A=a:x')

    expect(note.params.TYPE).toBeInstanceOf(VParameterListObject)
    expect(note.params.LANGUAGE).not.toBeInstanceOf(VParameterListObject)
    // @ts-expect-error LANGUAGE is not a list parameter
    expect(note.params.LANGUAGE?.list).toBeUndefined()
    // @ts-expect-error unknown parameters are not list parameters
    expect(note.params['X-A']?.list).toBeUndefined()
  })

  it('splits PID and SORT-AS as lists', () => {
    expect(property('EMAIL;PID=1.1,2.1:a@b').params.PID?.list).toEqual(['1.1', '2.1'])
    expect(property('N;SORT-AS="Doe","Jane":Doe;Jane;;;').params['SORT-AS']?.list).toEqual(['Doe', 'Jane'])
  })

  it('decodes caret escapes in each value', () => {
    expect(property('TEL;TYPE="a^\'b","c^^d":+1').params.TYPE?.list).toEqual(['a"b', 'c^d'])
  })

  it('keeps a value containing a colon or semicolon whole', () => {
    expect(property('NOTE;TYPE="a:b";X-B="c;d":x')).toMatchObject({ value: 'x' })
    expect(property('NOTE;TYPE="a:b":x').params.TYPE?.list).toEqual(['a:b'])
  })

  it('groups a repeated parameter at its first position when written', () => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      'TEL;TYPE=work;PREF=1;TYPE=voice:+1',
      'END:VCARD',
    ].join('\r\n'))

    expect(serialize(card)).toContain('TEL;TYPE=work;TYPE=voice;PREF=1:+1\r\n')
  })

  it.each([
    'NOTE;LANGUAGE=en',
    'TEL;TYPE="work"voice:+1',
    'TEL;TYPE="work:+1',
    'TEL;TYPE=wo"rk:+1',
    'TEL;TYPE=work,"voice:+1',
    'TEL;TYPE=:+1',
  ])('rejects the malformed line %s', line => {
    expect(() => property(line)).toThrow('Invalid property parameter')
  })
})

describe('editing parameters', () => {
  it('round-trips scalar and list parameters edited to contain empty values', () => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nNOTE;LABEL=desk;TYPE=work:x\r\nEND:VCARD')
    const note = card.first('NOTE')!
    note.params.LABEL.value = ''
    note.params.TYPE!.list = ['', 'home', '']

    const encoded = serialize(card)
    expect(encoded).toContain('NOTE;LABEL="";TYPE="",home,"":x\r\n')
    const decoded = deserializeCard(encoded).first('NOTE')!
    expect(decoded.params.LABEL.value).toBe('')
    expect(decoded.params.TYPE!.list).toEqual(['', 'home', ''])
  })

  const output = (line: string, edit: (parameter: VParameterListObject) => void) => {
    const card = deserializeCard([
      'BEGIN:VCARD',
      'VERSION:4.0',
      'FN:Jane Doe',
      line,
      'END:VCARD',
    ].join('\r\n'))
    edit(card.properties.at(-1)!.params.TYPE as VParameterListObject)
    return serialize(card)
  }

  it('writes edited values in the single standard form', () => {
    expect(output('TEL;TYPE=work;TYPE=voice:+1', parameter => {
      parameter.list = ['home', 'cell']
    })).toContain('TEL;TYPE=home,cell:+1\r\n')
  })

  it('splits a list parameter when its value is set', () => {
    expect(output('TEL;TYPE="work","voice":+1', parameter => {
      parameter.value = 'home,cell'
      expect(parameter.list).toEqual(['home', 'cell'])
    })).toContain('TEL;TYPE=home,cell:+1\r\n')
  })

  it('quotes each value that needs it', () => {
    expect(output('TEL;TYPE=work:+1', parameter => {
      parameter.list = ['work', 'a:b', 'c;d']
    })).toContain('TEL;TYPE=work,"a:b","c;d":+1\r\n')
  })

  it('leaves out a parameter with no values', () => {
    expect(output('TEL;TYPE=work:+1', parameter => {
      parameter.list = []
    })).toContain('TEL:+1\r\n')
  })

  it('leaves out a new list parameter with no value', () => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nEND:VCARD')
    card.add(new VPropertyTextType('NOTE', 'x', null, { TYPE: new VParameterListObject('TYPE') }))

    expect(serialize(card)).toContain('NOTE:x\r\n')
  })

  it('does not let the returned values change the parameter', () => {
    const parameter = new VParameterListObject('TYPE', 'work,voice')
    ;(parameter.list as string[]).push('home')

    expect(parameter.list).toEqual(['work', 'voice'])
  })

  it('copies constructor and setter arrays while preserving comma-containing items', () => {
    const values = ['a,b', 'c']
    const parameter = new VParameterListObject('TYPE', values)
    values.push('d')
    expect(parameter.list).toEqual(['a,b', 'c'])

    parameter.list = values
    values.push('e')
    expect(parameter.list).toEqual(['a,b', 'c', 'd'])
    expect(parameter.value).toBe('a,b,c,d')
  })

  it('round-trips a new parameter built in code', () => {
    const card = deserializeCard('BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nEND:VCARD')
    card.add(new VPropertyTextType('NOTE', 'x', null, {
      TYPE: new VParameterListObject('TYPE', ['a:b', 'c,d']),
      LABEL: new VParameterObject('LABEL', 'one, two'),
    }))

    const note = deserializeCard(serialize(card)).first('NOTE')
    expect(note?.params.TYPE?.list).toEqual(['a:b', 'c,d'])
    expect(note?.params.LABEL?.value).toBe('one, two')
  })

  it('does not keep source text containing a line break', () => {
    const parameter = decodeParameters(';TYPE="work\rEMAIL:evil@example.com":x').params.TYPE!

    expect(parameter.source).toBeNull()
  })
})
