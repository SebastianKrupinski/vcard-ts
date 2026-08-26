# vCard fixtures

These fixtures are synthetic and contain no personal data. Each file covers a
specific parser behavior rather than imitating a particular contact provider.

- `valid/v3-basic.vcf`: common vCard 3.0 fields
- `valid/v3-conformance.vcf`: vCard 3.0 time zone, coordinates, inline binary,
  and agent text
- `valid/v4-basic.vcf`: version detection and common vCard 4.0 fields
- `valid/v4-conformance.vcf`: vCard 4.0 typed, synchronization, and extension
  properties
- `valid/folded-lines.vcf`: physical line unfolding
- `valid/escaped-text.vcf`: escaped newlines, commas, and semicolons
- `valid/grouped-properties.vcf`: property groups and multiple parameters
- `valid/extensions.vcf`: preservation of unknown extension properties
- `invalid/`: malformed card and content-line examples

Every valid fixture participates in a semantic deserialize, serialize, and
deserialize round-trip test.
