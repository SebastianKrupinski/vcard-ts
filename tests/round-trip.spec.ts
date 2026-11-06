import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { deserializeCard, serialize } from '../src/VCard'
import { VParameterListObject, VParameterObject } from '../src/parameters/VParameterObject'

type Version = '3.0' | '4.0'

describe('trailing whitespace in property values', () => {
  it.each(['3.0', '4.0'] as const)('preserves spaces and tabs through %s round trips', version => {
    for (const value of ['one  ', 'one\t', '  \t', '', 'one\r\n  two \t']) {
      const source = card(version, `NOTE:${value}`)
      const parsed = deserializeCard(source)
      const expected = value.replace('\r\n ', '')

      expect(parsed.first('NOTE')!.value).toBe(expected)
      expectToRoundTrip(source)
      expect(deserializeCard(serialize(parsed)).first('NOTE')!.value).toBe(expected)
    }
  })

  it.each(['3.0', '4.0'] as const)('preserves trailing whitespace after editing and folding in %s', version => {
    const parsed = deserializeCard(card(version, 'NOTE:original'))
    const value = `${'long text '.repeat(12)} \t`
    parsed.notes[0].value = value

    const encoded = serialize(parsed)
    expect(encoded).toContain('\r\n ')
    expect(deserializeCard(encoded).first('NOTE')!.value).toBe(value)
  })

  it('preserves the final collection item and unknown property whitespace', () => {
    const source = card('4.0', 'CATEGORIES:one,two \t\r\nX-CUSTOM:three  ')
    const parsed = deserializeCard(source)

    expect(parsed.first('CATEGORIES')!.value).toEqual(['one', 'two \t'])
    expect(parsed.first('X-CUSTOM')!.value).toBe('three  ')
    expectToRoundTrip(source)
  })

  it('still rejects a nested card marker followed by whitespace', () => {
    expect(() => deserializeCard(card('4.0', 'BEGIN:VCARD  '))).toThrow('nested card marker')
  })
})

describe('newlines in edited text', () => {
  it.each(['\r', '\r\n', '\n'])('keeps newline %j inside property and parameter values', newline => {
    const parsed = deserializeCard(card('4.0', 'NOTE;LABEL=original;TYPE=work:original'))
    const note = parsed.notes[0]
    const value = `one${newline}EMAIL:evil@example.com`
    note.value = value
    note.params.LABEL!.value = value
    ;(note.params.TYPE as VParameterListObject).list = [value]
    note.params['X-LABEL'] = new VParameterObject('X-LABEL', value)

    const encoded = serialize(parsed)
    expect(encoded.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
    const decoded = deserializeCard(encoded)
    const decodedNote = decoded.first('NOTE')!
    expect(decoded.all('EMAIL')).toHaveLength(0)
    expect(decodedNote.value).toBe('one\nEMAIL:evil@example.com')
    expect(decodedNote.params.LABEL!.value).toBe('one\nEMAIL:evil@example.com')
    expect(decodedNote.params.TYPE!.list).toEqual(['one\nEMAIL:evil@example.com'])
    expect(decodedNote.params['X-LABEL'].value).toBe('one\nEMAIL:evil@example.com')
  })
})

function fixture(path: string): string {
  return readFileSync(new URL(`./fixtures/${path}`, import.meta.url), 'utf8')
}

function card(version: Version, line: string): string {
  return [
    'BEGIN:VCARD',
    `VERSION:${version}`,
    'FN:Round Trip',
    // N is required in 3.0, so a line under test can't be mistaken for it there.
    ...(version === '3.0' ? ['N:Trip;Round;;;'] : []),
    line,
    'END:VCARD',
  ].join('\r\n')
}

/** Uppercase parameter names, leaving quoted text and the property value alone. */
function normalizeParameterNames(line: string): string {
  let result = ''
  let inQuotes = false
  let inParameterName = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    if (character === '"') inQuotes = !inQuotes
    if (!inQuotes && character === ':') return result + line.slice(index)
    if (!inQuotes && character === '=') inParameterName = false

    result += inParameterName ? character.toUpperCase() : character

    if (!inQuotes && character === ';') inParameterName = true
  }
  return result
}

/**
 * Reduce vCard text to its content lines, ignoring only what carries no meaning:
 * line endings, folding, blank lines, and the case of parameter names.
 *
 * Unfolding is done here rather than with the library's own codec, so that a
 * codec bug can't hide itself from these tests.
 */
function contentLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
    .filter(line => line.length > 0)
    .map(normalizeParameterNames)
}

function expectToRoundTrip(source: string): void {
  expect(contentLines(serialize(deserializeCard(source)))).toEqual(contentLines(source))
}

function expectToRoundTripOrReject(source: string): void {
  let output: string
  try {
    output = serialize(deserializeCard(source))
  } catch {
    return
  }
  expect(contentLines(output)).toEqual(contentLines(source))
}

describe('round trip against source text', () => {
  it.each([
    'valid/v3-basic.vcf',
    'valid/v3-conformance.vcf',
    'valid/v4-basic.vcf',
    'valid/v4-conformance.vcf',
    'valid/folded-lines.vcf',
    'valid/escaped-text.vcf',
    'valid/grouped-properties.vcf',
    'valid/extensions.vcf',
  ])('%s', path => {
    expectToRoundTrip(fixture(path))
  })

  it.each<[Version, string]>([
    ['3.0', 'REV:1995-10-31T22:27:10Z'],
    ['3.0', 'BDAY:1996-04-15T10:22:00'],
    ['3.0', 'BDAY:1953-10-15T23:10:00Z'],
    ['4.0', 'BDAY:19850412'],
    ['4.0', 'BDAY:1985'],
    ['4.0', 'BDAY:1985-04'],
    ['4.0', 'BDAY:--0412'],
    ['4.0', 'BDAY:---12'],
    ['4.0', 'BDAY:T1022'],
    ['4.0', 'BDAY:19850412T102200Z'],
    ['4.0', 'ANNIVERSARY:20090808T1430-0500'],
    ['3.0', 'REV:1997-11-15'],
    ['4.0', 'BDAY:1985-04-12'],
    ['4.0', 'BDAY:19850412T'],
    ['4.0', 'BDAY:garbage'],
    ['4.0', 'BDAY:19851332'],
    ['3.0', 'REV:19951031T222710Z'],
    ['4.0', 'REV:19951031T222710Z'],
    ['3.0', 'TZ:-05:00'],
    ['4.0', 'TZ:America/New_York'],
    ['4.0', 'TZ;VALUE=text:Raleigh/North America'],
    ['3.0', 'GEO:37.386013;-122.082932'],
    ['4.0', 'GEO:geo:46.772673,-71.282945'],
    ['4.0', 'BDAY;VALUE=text:circa 1800'],
    ['3.0', 'PHOTO;ENCODING=b;TYPE=JPEG:AAAA'],
    ['3.0', 'SOUND;ENCODING=b;TYPE=WAV:AAAA'],
    ['3.0', 'LOGO;VALUE=uri:http://example.com/logo.png'],
    ['4.0', 'KEY:https://example.com/key.pgp'],
    ['4.0', 'KEY;VALUE=text:OPENPGP4FPR:ABC'],
    ['4.0', 'TEL;VALUE=uri:tel:+1-555-555-5555;ext=2'],
    ['4.0', 'TEL;TYPE=work,voice:+1'],
    ['3.0', 'TEL;TYPE=work;TYPE=voice:+1'],
    ['3.0', 'TEL;TYPE=CELL;TYPE=VOICE;TYPE=pref:+1'],
    ['4.0', 'TEL;TYPE="work","voice":+1'],
    ['4.0', 'TEL;TYPE="work,voice":+1'],
    ['4.0', 'TEL;TYPE=work,"a:b":+1'],
    ['4.0', 'NOTE;TYPE="a:b":x'],
    ['4.0', 'NOTE;X-A="a^nb":x'],
    ['4.0', 'NOTE;X-A=a,b:x'],
    ['4.0', 'NOTE;X-A="a","b":x'],
    ['4.0', 'EMAIL;PID=1.1,2.1:jane@example.com'],
    ['4.0', 'ADR;LABEL="1 Main St, Town":;;1 Main St;Town;;;'],
    ['4.0', 'EMAIL;PID="1.1,2.1":jane@example.com'],
    ['4.0', 'N;SORT-AS="Doe,Jane":Doe;Jane;;;'],
    ['4.0', 'ORG:Acme\\, Inc;Sales\\;EMEA;West'],
    ['4.0', 'NICKNAME:Jim,Jimmie\\, Jr'],
    ['4.0', 'GENDER:M;Fellow'],
    ['4.0', 'RELATED;TYPE=friend:urn:uuid:1'],
    ['4.0', 'CLIENTPIDMAP:1;urn:uuid:1'],
    ['4.0', 'X-CUSTOM;X-PARAM=a:b\\,c\\;d'],
  ])('%s %s', (version, line) => {
    expectToRoundTrip(card(version, line))
  })
})

// Each case below is a confirmed bug. `it.fails` keeps the suite green until the
// bug is fixed, then fails to say the case should move up to the passing list.
describe('known round-trip bugs', () => {
  it.fails.each<[Version, string]>([
    // Inline binary on properties that can also hold a URI or text
    ['3.0', 'KEY;ENCODING=b:AAAA'],

    // Geographic URI details
    ['4.0', 'GEO:geo:46.772673,-71.282945,10'],
    ['4.0', 'GEO:geo:46.772673,-71.282945;u=20'],

    // Comma-separated lists inside structured components
    ['4.0', 'N:Doe;Jane;Ann,Lee;;'],
    ['4.0', 'ADR:;;1 Main,Apt 2;Town;;;'],
  ])('%s %s', (version, line) => {
    expectToRoundTrip(card(version, line))
  })

  it.fails.each<[Version, string]>([
    ['4.0', 'GEO:not-a-geo'],
    ['4.0', 'a.b.NOTE:x'],
    ['4.0', 'NOTE:a\\:b'],
  ])('%s %s should be kept or rejected, not altered', (version, line) => {
    expectToRoundTripOrReject(card(version, line))
  })
})
