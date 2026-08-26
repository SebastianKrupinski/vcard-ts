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

Use `deserializeCard` when the input must contain exactly one card:

```ts
import { deserializeCard } from 'vcard-ts'

const card = deserializeCard(input)
```

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

Groups and parameters remain available on each property. Parsed parameter
names are normalized to uppercase, so the `TYPE` in
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

## Development

```sh
npm install
npm run check
```

`npm run check` runs the TypeScript check, test suite, and package build. The
package requires Node.js 20 or newer.
