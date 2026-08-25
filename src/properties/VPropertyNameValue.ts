import { VParameterValueOptions } from "../parameters/VParameterTypes"

export class VPropertyNameValue {

	private _family: string
	private _given: string
	private _additional: string
	private _prefix: string
	private _suffix: string

	constructor(
		family: string = '',
		given: string = '',
		additional: string = '',
		prefix: string = '',
		suffix: string = '',
	) {
		this._family = family
		this._given = given
		this._additional = additional
		this._prefix = prefix
		this._suffix = suffix
	}

	deserialize(value: string): VPropertyNameValue {
		const parts = value.split(';')
		this._family = parts[0] || ''
		this._given = parts[1] || ''
		this._additional = parts[2] || ''
		this._prefix = parts[3] || ''
		this._suffix = parts[4] || ''
		return this
	}

	serialize(): string {
		return [this._family, this._given, this._additional, this._prefix, this._suffix].join(';')
	}

	type(): string {
		return VParameterValueOptions.TEXT
	}

	get family(): string {
		return this._family
	}

	set family(family: string) {
		this._family = family
	}

	get given(): string {
		return this._given
	}

	set given(given: string) {
		this._given = given
	}

	get additional(): string {
		return this._additional
	}

	set additional(additional: string) {
		this._additional = additional
	}

	get prefix(): string {
		return this._prefix
	}

	set prefix(prefix: string) {
		this._prefix = prefix
	}

	get suffix(): string {
		return this._suffix
	}

	set suffix(suffix: string) {
		this._suffix = suffix
	}

}
