import { VPropertyStructuredValue } from "./VPropertyStructuredValue"

const NAME_FIELDS = [
	'family',
	'given',
	'additional',
	'prefix',
	'suffix',
	'secondarySurname',
	'generation',
] as const

export type VPropertyNameField = typeof NAME_FIELDS[number]

/**
 * An N value. Accessors such as `given` read the first item and replace the whole
 * list, while `getList('given')` exposes every item.
 */
export class VPropertyNameValue extends VPropertyStructuredValue<VPropertyNameField> {

	constructor(
		family: string | string[] = '',
		given: string | string[] = '',
		additional: string | string[] = '',
		prefix: string | string[] = '',
		suffix: string | string[] = '',
	) {
		super(NAME_FIELDS, 5, [family, given, additional, prefix, suffix])
	}

	get family(): string {
		return this.getList('family')[0] ?? ''
	}

	set family(family: string) {
		this.setList('family', family)
	}

	get given(): string {
		return this.getList('given')[0] ?? ''
	}

	set given(given: string) {
		this.setList('given', given)
	}

	get additional(): string {
		return this.getList('additional')[0] ?? ''
	}

	set additional(additional: string) {
		this.setList('additional', additional)
	}

	get prefix(): string {
		return this.getList('prefix')[0] ?? ''
	}

	set prefix(prefix: string) {
		this.setList('prefix', prefix)
	}

	get suffix(): string {
		return this.getList('suffix')[0] ?? ''
	}

	set suffix(suffix: string) {
		this.setList('suffix', suffix)
	}

	get secondarySurname(): string {
		return this.getList('secondarySurname')[0] ?? ''
	}

	set secondarySurname(secondarySurname: string) {
		this.setList('secondarySurname', secondarySurname)
	}

	get generation(): string {
		return this.getList('generation')[0] ?? ''
	}

	set generation(generation: string) {
		this.setList('generation', generation)
	}

}
