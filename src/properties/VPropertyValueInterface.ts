import type { VCardVersion } from '../VCardInterfaces'

/** Contract for built-in and custom structured property values. */
export interface VPropertyValueInterface {
	serialize(version?: VCardVersion): string
	type(): string
}
