# vcard-ts

A typed TypeScript library for reading, editing, and serializing vCard 3.0 and
4.0 data.

`vcard-ts` turns known vCard properties into typed property and value models.
It also preserves property order, groups, parameters, extension properties,
and escaped text, while supporting folded content lines.

## Quick start

`deserialize` reads every vCard in a string and returns an array. The same
array can be passed directly to `serialize` after it has been inspected or
edited.

```ts
import { deserialize, serialize } from 'vcard-ts'

const input = [
  'BEGIN:VCARD',
  'VERSION:4.0',
  'FN:Jane Doe',
  'N:Doe;Jane;;;',
  'EMAIL;TYPE=work:jane@example.com',
  'END:VCARD',
].join('\r\n')

const cards = deserialize(input)
const card = cards[0]
const email = card.emails[0]

console.log(card.formattedName?.value) // Jane Doe
console.log(email?.value)              // jane@example.com
console.log(email?.params.TYPE?.value) // work

const output = serialize(cards)
```

`deserialize` accounts for every line of the input. Blank lines between cards are
fine, but anything else outside a card, or a card without `END:VCARD`, throws an
error naming the card and line instead of losing that data.

Use `deserializeCard` when the input must contain exactly one card:

```ts
import { deserializeCard } from 'vcard-ts'

const card = deserializeCard(input)
```

## Constructing cards

Add typed properties directly to a new card:

`createCard()` defaults to 4.0. It accepts only `'3.0'` or `'4.0'`; unsupported
runtime values throw instead of falling back to another version.

```ts
import {
  createCard, serialize, VPropertyNameType, VPropertyNameValue,
  VPropertyTextType, VPropertyUriType,
} from 'vcard-ts'

const card = createCard('4.0')
card.add(new VPropertyTextType('FN', 'Jane Doe'))
card.add(new VPropertyNameType('N', new VPropertyNameValue('Doe', 'Jane')))
card.add(new VPropertyUriType('URL', 'https://example.com'))

const output = serialize(card)
```

Collections and card editing methods accept all property value types. Named
getters retain their specific types, so `card.name?.value?.given` is typed as
a string when present.

`card.properties` returns a frozen, read-only snapshot of the collection. Use
`add`, `revise`, `reviseById`, `drop`, or `dropById` to change its membership.
Property objects and their values remain editable through their concrete types.
The constructor copies its input array, and previously read snapshots do not
change when properties are subsequently added or removed.

Generic access through `first`, `all`, `findById`, or `properties` exposes a
read-only value typed `string | string[] | VPropertyValueBase`. Narrow it with
`typeof`, `Array.isArray`, or `instanceof VPropertyValueBase` before use. To
change a value, assign through a named getter or concrete class such as
`card.name!.value`, or replace the property with `card.revise`.

Built-in structured values extend the abstract `VPropertyValueBase` class, which
requires `serialize(version?: VCardVersion): string` and `type(): string`. Custom
values must extend it too, but don't need a property registry entry. Plain objects
are rejected at compile time, and serializing one throws an error.

### Strings and escaping

Constructors and `.value` read a string the same way. Text is used exactly as
written, so don't escape it. The library escapes it on output:

```ts
const note = new VPropertyTextType('NOTE', 'Line one\nDoe, Jane \\ Co')
serializeProperty(note)  // NOTE:Line one\nDoe\, Jane \\ Co
```

Other properties convert the string to their value type, so assigning to a URL
keeps it a URI:

```ts
card.urls[0].value = 'https://example.com/a,b;c'
serializeProperty(card.urls[0])  // URL:https://example.com/a,b;c
```

Strings for structured properties use the vCard format, as in
`new VPropertyNameType('N', 'Doe;Jane;;;')`. A string for a list property is one
item, so pass an array for several. To read text that's already encoded for a vCard
line, use `new VPropertyTextType('NOTE').deserialize('Doe\\, Jane')`.

Encoded text accepts `\\`, `\,`, `\;`, and `\n` (or `\N`). Unsupported escapes
such as `\:` and trailing unpaired backslashes are rejected. Literal text passed
to a text constructor or assigned to `.value` is escaped automatically.

`VALUE` is only written when a property's value isn't the type readers assume, as
with a URI in `TEL` or text in `BDAY`. An existing `VALUE` that still matches is kept.
For a property that can hold several forms, set `property.type` first to choose how
a later string is read.

## Typed property getters

Common properties are available directly on the card. Singular properties
return a typed property or `null`; repeatable properties return arrays.

```ts
const formattedName = card.formattedName?.value
const name = card.name?.value
const birthday = card.birthDay?.value
const gender = card.gender?.value

const emailAddresses = card.emails.map(property => property.value)
const telephoneNumbers = card.telephones.map(property => property.value)
const addresses = card.addresses.map(property => property.value)
```

The current named getters are:

- `prodId`, `uid`, `revision`, `kind`, `name`, and `formattedName`
- `birthDay`, `birthPlace`, `deathDay`, `deathPlace`, `anniversary`, and
  `gender`
- `addresses`, `telephones`, and `emails`
- `nicknames`, `photos`, `organizations`, `titles`, `roles`, `notes`, and
  `urls`
- `instantMessaging`, `languages`, `timeZones`, `geoLocations`, and
  `categories`

Other registered properties are still parsed into their appropriate property
types and can be accessed by name.

Unknown properties use the generic model. When `VALUE=uri` is declared, their
string values are preserved without text decoding or escaping, including when
constructed or assigned in code.

## Structured values

Structured properties expose their individual fields. There is no need to
split the raw vCard value yourself.

```ts
const name = card.name?.value

console.log(name?.prefix)
console.log(name?.given)
console.log(name?.additional)
console.log(name?.family)
console.log(name?.suffix)

const address = card.addresses[0]?.value

console.log(address?.poBox)
console.log(address?.extended)
console.log(address?.street)
console.log(address?.locality)
console.log(address?.region)
console.log(address?.code)
console.log(address?.country)

const gender = card.gender?.value

console.log(gender?.sex)
console.log(gender?.identity)
```

Typed values can be edited in place before the card is serialized:

```ts
const name = card.name?.value
if (name) {
  name.given = 'Janet'
  name.family = 'Doe'
}

const address = card.addresses[0]?.value
if (address) {
  address.locality = 'Toronto'
  address.region = 'Ontario'
}

const output = serialize(card)
```

`GEO` coordinate values use `VPropertyUriGeoValue`. Parsed altitude and URI
parameters are preserved, including when latitude or longitude is edited.
Other URI schemes use `VPropertyUriValue`; narrow with `instanceof
VPropertyUriGeoValue` before accessing coordinate fields. Malformed coordinate
strings are rejected instead of being converted to zeroes.

## Dates and times

Date and time properties expose their fields, such as `year`, `month`, `hour`,
and `offset` (in minutes). Fields that a value doesn't include are `null`, so
`BDAY:--0412` has no `year`.

```ts
const birthday = card.birthDay?.value

console.log(birthday?.month)
console.log(birthday?.source) // the original text, such as --0412
```

A value that hasn't changed is written back exactly as it was read. Once you
edit a value, or change `card.version`, it's written in the standard form for
the card's version: extended for 3.0 (`1985-04-12T10:22:00Z`) and basic for 4.0
(`19850412T102200Z`).

Text that isn't a valid date, such as `BDAY:garbage`, leaves the fields `null`
but stays available through `source` and is still written back unchanged.
Impossible calendar dates, such as February 31 or February 29 in a non-leap year,
follow the same rule. February 29 without a year remains valid. Dates constructed
or edited in code must have valid integer fields and a valid calendar day;
serialization throws if they do not.

Constructed or edited times require integer hours from 0 to 23, minutes from 0 to
59, seconds from 0 to 60, and UTC offsets from -1439 to 1439 minutes. An offset
requires a time. Invalid numeric fields throw on serialization; invalid parsed
text retains its source without exposing parsed fields.

## Generic property access

Use `first` and `all` for registered properties without a named getter,
custom properties, and `X-` extensions. Property names are matched without
regard to case.

```ts
const firstLanguage = card.first('LANG')
const socialProfiles = card.all('SOCIALPROFILE')
const customValue = card.first('X-CUSTOM-FIELD')?.value

if (card.has('EMAIL')) {
  console.log('The card contains at least one email address')
}
```

## Property groups and parameters

Groups and parameters remain available on each property. Parsed parameter names,
names passed to parameter class constructors, and keys created by
`VParameterCollection` are normalized to uppercase, so the `TYPE` in
`EMAIL;TYPE=work:jane@example.com` can be accessed directly by name:

```ts
const email = card.emails[0]

if (email) {
  console.log(email.hasParams)         // true
  console.log(email.params.TYPE?.name) // TYPE
  console.log(email.params.TYPE?.value) // work

  for (const parameter of Object.values(email.params)) {
    console.log(parameter.name, parameter.value)
  }
}
```

`TYPE`, `PID`, and `SORT-AS` are list parameters, which also have a `list`.
`TYPE=work;TYPE=voice`, `TYPE=work,voice`, and `TYPE="work","voice"` all give the
same result:

```ts
const type = card.telephones[0]?.params.TYPE

console.log(type?.list)  // ['work', 'voice']
console.log(type?.value) // work,voice
```

Quoted commas stay inside their item: `TYPE="work,voice",cell` has the list
`['work,voice', 'cell']`. Setting `list` preserves these item boundaries; setting
`value` splits the supplied string at every comma. Reading `value` joins the
items with commas, so use `list` when individual items can contain commas.

Other parameters only have `value`, and a comma is part of it, so
`LABEL="1 Main St, Town"` is a single value.

A parameter you don't change keeps its original form when written. Setting
`value` or `list` writes it in one form, such as `TYPE=home,cell`.

The property group is separate from its parameters:

```ts
console.log(email?.group) // null for the ungrouped email above
```

For a content line beginning with
`item1.EMAIL;TYPE=work:jane@example.com`, `group` would be `item1`.

## Removing properties

Remove one property by passing the property itself, or remove every property
with a given name by passing its name:

```ts
const email = card.emails[0]
if (email) {
  card.drop(email)
}

card.drop('X-OBSOLETE-FIELD')
```

## Name and address lists

`N` and `ADR` components can each hold several values, such as
`N:Doe;Jane,Janet;;;`. Most cards only use one, so the field accessors work with
single values, and `getList` and `setList` handle the rest:

```ts
const name = card.name?.value

name?.given             // 'Jane': the first item
name?.getList('given')  // ['Jane', 'Janet']: every item

name!.setList('given', ['Jane', 'Janet'])  // replace the list
name!.getList('given').push('June')        // change the list in place
name!.given = 'June'                       // replace the whole list with one item
```

Constructors accept either form, as in `new VPropertyNameValue('Doe', ['Jane', 'Janet'])`.
A comma inside a single value stays part of that value and is escaped on output.

The RFC 9554 fields are also available, and work with `getList` and `setList` too:

- `N`: `secondarySurname`, `generation`
- `ADR`: `room`, `apartment`, `floor`, `streetNumber`, `streetName`, `building`,
  `block`, `subdistrict`, `district`, `landmark`, `direction`

These fields are only written when set, so other cards keep their usual shape.
Components beyond the known fields are preserved. RFC 9554 recommends also filling
the older fields for compatibility, such as a combined `street`, and setting one
field doesn't update another, so set both when other software needs to read the card.

## Serialization

`serialize` accepts one card or an array of cards, including the array returned
by `deserialize`.

```ts
const oneCard = serialize(card)
const everyCard = serialize(cards)
```

Serialized output uses CRLF line endings and folds content lines at 75 UTF-8
bytes.

## Supported standards

- vCard 3.0 from RFC 2426
- vCard 4.0 from RFC 6350
- Registered properties from RFC 6474, RFC 6715, RFC 8605, RFC 9554, and
  RFC 9555

Known URI, text, temporal, media, structured-name, address, gender, geography,
organization, and client-PID-map values are decoded into dedicated value
models. Other registered and extension properties use the generic property
model so they can still be read and serialized.

vCard 2.1 is intentionally unsupported. The `N` and `ADR` models expose one
string per structured component, and vCard 3.0 `AGENT` values are treated as
text.

## Validation

Deserialization rejects unsupported versions and malformed card boundaries. A
card must contain exactly one `VERSION` property and at least one `FN`
property. A vCard 3.0 card must also contain an `N` property.
For vCard 4.0, `VERSION` must be the first unfolded line after `BEGIN:VCARD`,
without intervening properties or blank lines. vCard 3.0 allows a later `VERSION`.
`BEGIN` and `END` are reserved for card boundaries; extra occurrences inside a
card, including malformed markers such as `END:VCARDjunk`, are rejected.

Malformed `CLIENTPIDMAP` mappings are rejected instead of being written back as
empty values. Each mapping needs a positive safe-integer source ID and an absolute
URI without whitespace; incomplete constructed mappings throw on serialization.

Encoded UTC offsets must have a sign and two-digit hours, with optional two-digit
minutes. Hours above 23, minutes above 59, and malformed offsets are rejected.
Unset or invalid numeric UTC offset models throw on serialization instead of
producing empty values.

For vCard 4.0, registered singleton properties such as `N`, `UID`, `REV`,
`BDAY`, `ANNIVERSARY`, and `GENDER` may occur at most once. Alternative
representations carrying the same `ALTID` count as one logical property.

## Development

```sh
npm install
npm run check
```

`npm run check` runs the TypeScript check, test suite, and package build. The
package requires Node.js 20 or newer.
