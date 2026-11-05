import { describe, expect, it } from 'vitest'
import { decodeParameters, encodeParameters } from '../../src/codecs/parameter'
import { VParameterListObject, VParameterObject } from '../../src/parameters/VParameterObject'

describe('parameter codec', () => {
  it.each(['a;TYPE=work', 'a:EMAIL:evil@example.com', 'a\r\nEMAIL:evil@example.com'])('ignores custom source %j', source => {
    const encoded = encodeParameters({ LABEL: { name: 'LABEL', value: 'safe; desk: north', source: [source] } })

    expect(encoded).toBe('LABEL="safe; desk: north"')
    const { params, remaining } = decodeParameters(`;${encoded}:original`)
    expect(Object.keys(params)).toEqual(['LABEL'])
    expect(params.LABEL.value).toBe('safe; desk: north')
    expect(remaining).toBe(':original')
  })

  it('encodes custom list items instead of their supplied source', () => {
    const parameter = { name: 'TYPE', value: 'a,b,c', list: ['a,b', 'c'], source: ['work;PREF=1'] }
    const encoded = encodeParameters({ TYPE: parameter })

    expect(encoded).toBe('TYPE="a,b",c')
    expect(decodeParameters(`;${encoded}:x`).params.TYPE?.list).toEqual(['a,b', 'c'])
  })

  it('ignores source overridden on a parameter subclass', () => {
    class CustomParameter extends VParameterObject {
      override get source(): readonly string[] { return ['a;TYPE=work'] }
    }

    expect(encodeParameters({ LABEL: new CustomParameter('LABEL', 'safe') })).toBe('LABEL=safe')
  })

  it('retains parser-recorded source until the value is edited', () => {
    const { params } = decodeParameters(';LABEL="desk; north";TYPE="work";TYPE=voice:x')

    expect(encodeParameters(params)).toBe('LABEL="desk; north";TYPE="work";TYPE=voice')
    params.LABEL.value = 'edited; desk'
    params.TYPE!.list = ['home', 'cell']
    expect(encodeParameters(params)).toBe('LABEL="edited; desk";TYPE=home,cell')
  })

  it('decodes repeated parameters and leaves the property value untouched', () => {
    const { params, remaining } = decodeParameters(';type="a,b",c;LABEL="desk; north: wing";TYPE=home:tel:+1;ext=2')

    expect(params.TYPE).toBeInstanceOf(VParameterListObject)
    expect(params.TYPE?.list).toEqual(['a,b', 'c', 'home'])
    expect(params.LABEL?.value).toBe('desk; north: wing')
    expect(remaining).toBe(':tel:+1;ext=2')
    expect(encodeParameters(params)).toBe('TYPE="a,b",c;TYPE=home;LABEL="desk; north: wing"')
  })

  it('decodes an empty parameter section', () => {
    expect(decodeParameters(':value')).toEqual({ params: {}, remaining: ':value' })
  })

  it.each([';TYPE:value', ';TYPE=:value', ';TYPE="a"junk:value', ';TYPE=work'])('rejects malformed input %s', source => {
    expect(() => decodeParameters(source)).toThrow('Invalid property parameter')
  })

  it.each([
    ';TYPE="work:x',
    ';TYPE=work":x',
    ';TYPE=wo"rk:x',
    ';TYPE="work""voice":x',
    ';TYPE=work,"voice:x',
    ';TYPE="work",vo"ice:x',
    ';TYPE=work;LABEL="desk:x',
    ';LABEL="desk;TYPE=work:x',
  ])('rejects misplaced or unmatched quotes in %s', source => {
    expect(() => decodeParameters(source)).toThrow('Invalid property parameter')
  })

  it.each([
    [';TYPE="work",voice:x', ['work', 'voice']],
    [';TYPE=work,"a,b;c:d":x', ['work', 'a,b;c:d']],
    [';TYPE="a^\'b",c^\'d:x', ['a"b', 'c"d']],
    [';TYPE="":x', ['']],
  ])('preserves valid quoted items in %s', (source, items) => {
    const { params, remaining } = decodeParameters(source as string)

    expect(params.TYPE?.list).toEqual(items)
    expect(remaining).toBe(':x')
    expect(`;${encodeParameters(params)}:x`).toBe(source)
  })

  it('round-trips encoded parameters', () => {
    const source = encodeParameters({ TYPE: new VParameterListObject('TYPE', ['a,b', 'c:d']) })
    const { params } = decodeParameters(`;${source}:value`)

    expect(params.TYPE?.list).toEqual(['a,b', 'c:d'])
  })

  it('encodes a complete parameter collection', () => {
    expect(encodeParameters({
      TYPE: new VParameterListObject('type', 'WORK,VOICE'),
      LABEL: { name: 'label', value: 'Desk, primary: north' },
      CN: { name: 'cn', value: 'Desk "A"' },
    })).toBe('TYPE=WORK,VOICE;LABEL="Desk, primary: north";CN=Desk ^\'A^\'')
  })
})
