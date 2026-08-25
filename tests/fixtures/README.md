# vCard fixtures

These fixtures are synthetic and contain no personal data. Each file covers a
specific parser behavior rather than imitating a particular contact provider.

- `valid/v3-basic.vcf`: common vCard 3.0 fields
- `valid/v4-basic.vcf`: version detection and common vCard 4.0 fields
- `valid/folded-lines.vcf`: physical line unfolding
- `valid/escaped-text.vcf`: escaped newlines, commas, and semicolons
- `valid/grouped-properties.vcf`: property groups and multiple parameters
- `valid/extensions.vcf`: preservation of unknown extension properties
- `invalid/`: malformed card and content-line examples

When card serialization is implemented, the valid fixtures should also be used
for semantic round-trip tests: deserialize, serialize, then deserialize again.
