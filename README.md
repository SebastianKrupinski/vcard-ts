# vcard-ts

Typed vCard deserialization, editing, and serialization for TypeScript.

The library supports vCard 3.0 and 4.0. It preserves property order, groups,
parameters, escaped text, extension properties, and folded content lines.

## Supported formats

- vCard 3.0 from RFC 2426, including legacy inline binary media and `AGENT`
- vCard 4.0 from RFC 6350
- Registered properties from RFC 6474, RFC 6715, RFC 8605, RFC 9554, and
  RFC 9555

vCard 2.1 is intentionally unsupported. The `N` and `ADR` APIs expose one
string per structured component, and vCard 3.0 `AGENT` values are exposed as
text. Unknown and extension properties are preserved with the generic property
type.

## Usage

```ts
import { deserialize, serialize } from 'vcard-ts'

const cards = deserialize(vcardText)
const firstCard = cards[0]

console.log(firstCard.formattedName?.value)

const output = serialize(cards)
```

Use `deserializeCard` when the input must contain exactly one vCard:

```ts
import { deserializeCard } from 'vcard-ts'

const card = deserializeCard(vcardText)
```

Create and serialize a new card with the typed property classes:

```ts
import { createCard, serialize, VPropertyTextType } from 'vcard-ts'

const card = createCard('4.0')
card.add(new VPropertyTextType('FN', 'Jane Doe'))
card.add(new VPropertyTextType('EMAIL', 'jane@example.com'))

const output = serialize(card)
```

`serialize` accepts either one card or the array returned by `deserialize`.
Output uses CRLF line endings and folds content lines at 75 UTF-8 bytes.

## Working with properties

```ts
const formattedName = card.formattedName?.value
const emailAddresses = card.emails.map(email => email.value)

// Generic access works for every property, including extensions.
const socialProfiles = card.all('X-SOCIALPROFILE')
const firstCustomValue = card.first('X-CUSTOM-FIELD')

card.drop('EMAIL')
```

Common single-value properties are exposed through typed getters such as
`formattedName`, `name`, `birthDay`, and `gender`. Repeatable properties use
array getters such as `emails`, `telephones`, and `addresses`. Unknown and `X-`
extension properties remain available through `first` and `all`, so they can
round-trip without being discarded.

Structured properties expose typed value getters instead of requiring you to
split their serialized text manually:

```ts
const name = card.name?.value
console.log(name?.given)
console.log(name?.family)

const address = card.addresses[0]?.value
console.log(address?.street)
console.log(address?.locality)
console.log(address?.region)
console.log(address?.code)
console.log(address?.country)

const gender = card.gender?.value
console.log(gender?.sex)
console.log(gender?.identity)
```

The value fields are editable through the matching setters:

```ts
const name = card.name?.value
if (name) {
  name.given = 'Janet'
  name.family = 'Doe'
}

const address = card.addresses[0]?.value
if (address) {
  address.locality = 'Toronto'
}

const output = serialize(card)
```

## Development

```sh
npm install
npm run check
```

`npm run check` runs the TypeScript check, test suite, and package build.
