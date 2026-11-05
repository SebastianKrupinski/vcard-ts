import { describe, expect, it } from 'vitest'
import { decodeParameters, encodeParameters } from '../../src/codecs/parameter'
import { VParameterListObject } from '../../src/parameters/VParameterObject'

describe('parameter codec', () => {
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
