import type { VCardVersion } from '../VCardInterfaces'
import type { VPropertyValueInterface } from './VPropertyValueInterface'

/** Base class for built-in and custom structured property values. */
export abstract class VPropertyValueBase implements VPropertyValueInterface {

	// Compile-time only: stops plain objects passing as values, which instanceof would reject.
	private declare readonly _structuredValue: never

	abstract serialize(version?: VCardVersion): string
	abstract type(): string

}
