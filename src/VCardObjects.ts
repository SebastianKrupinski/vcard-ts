import { VPropertyAddressType } from './properties/VPropertyAddressType'
import { VPropertyGenderType } from './properties/VPropertyGenderType'
import { VPropertyBaseInterface, VPropertyCollectionInterface } from './properties/VPropertyInterfaces'
import { VPropertyNameType } from './properties/VPropertyNameType'
import { VPropertyTemporalType } from './properties/VPropertyTemporalType'
import { VPropertyTextType } from './properties/VPropertyTextType'
import { VPropertyUriType } from './properties/VPropertyUriType'
import {
	VCardObjectInterface,
	VCardPropertyVersionValues,
} from './VCardInterfaces'

export class VCardObject implements VCardObjectInterface {

	private _version: VCardPropertyVersionValues = VCardPropertyVersionValues.V3_0
	properties: VPropertyCollectionInterface

	constructor(version: VCardPropertyVersionValues = VCardPropertyVersionValues.V3_0, properties: VPropertyCollectionInterface = []) {
		this._version = version
		this.properties = properties
	}

	add(value: VPropertyBaseInterface): void {
		this.properties.push(value)
	}

	fetch(name: string): VPropertyBaseInterface|VPropertyBaseInterface[]|null {
		const found = this.properties.filter((p) => p.name.toUpperCase() === name.toUpperCase())
		if (found.length === 0) {
			return null
		} else if (found.length === 1) {
			return found[0]
		} else {
			return found
		}
	}

	fetchById(id: string): VPropertyBaseInterface | null {
		const found = this.properties.find((p) => p.id === id)
		return found || null
	}

	revise(current: VPropertyBaseInterface, revision: VPropertyBaseInterface): void {
		const index = this.properties.findIndex((p) => p.id === current.id)
		if (index !== -1) {
			this.properties[index] = revision
		}
	}

	reviseById(id: string, revision: VPropertyBaseInterface): void {
		const index = this.properties.findIndex((p) => p.id === id)
		if (index !== -1) {
			this.properties[index] = revision
		}
	}

	drop(value: string|VPropertyBaseInterface): void {
		if (typeof value === 'string') {
			let index = this.properties.findIndex((p) => p.name.toUpperCase() === value.toUpperCase())
			while (index !== -1) {
				this.properties.splice(index, 1)
				index = this.properties.findIndex((p) => p.name.toUpperCase() === value.toUpperCase())
			}
		} else {
			const index = this.properties.findIndex((p) => p.id === value.id)
			if (index !== -1) {
				this.properties.splice(index, 1)
			}
		}
	}

	dropById(id: string): void {
		const index = this.properties.findIndex((p) => p.id === id)
		if (index !== -1) {
			this.properties.splice(index, 1)
		}
	}

	has(name: string): boolean {
		return this.properties.some((p) => p.name.toUpperCase() === name.toUpperCase())
	}

	get version(): VCardPropertyVersionValues {
		return this._version
	}

	set version(version: VCardPropertyVersionValues) {
		this._version = version
	}

	get prodId(): VPropertyTextType | null {
		const prop = this.fetch('PRODID')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get uid(): VPropertyTextType | null {
		const prop = this.fetch('UID')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get revision(): VPropertyTemporalType | null {
		const prop = this.fetch('REV')
		return prop && !Array.isArray(prop) ? prop as VPropertyTemporalType : null
	}

	get kind(): VPropertyTextType | null {
		const prop = this.fetch('KIND')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get name(): VPropertyNameType | null {
		const prop = this.fetch('N')
		return prop && !Array.isArray(prop) ? prop as VPropertyNameType : null
	}

	get formattedName(): VPropertyTextType | null {
		const prop = this.fetch('FN')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get birthDay(): VPropertyTemporalType | null {
		const prop = this.fetch('BDAY')
		return prop && !Array.isArray(prop) ? prop as VPropertyTemporalType : null
	}

	get birthPlace(): VPropertyTextType | null {
		const prop = this.fetch('BIRTHPLACE')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get deathDay(): VPropertyTemporalType | null {
		const prop = this.fetch('DEATHDAY')
		return prop && !Array.isArray(prop) ? prop as VPropertyTemporalType : null
	}

	get deathPlace(): VPropertyTextType | null {
		const prop = this.fetch('DEATHPLACE')
		return prop && !Array.isArray(prop) ? prop as VPropertyTextType : null
	}

	get anniversary(): VPropertyTemporalType | null {
		const prop = this.fetch('ANNIVERSARY')
		return prop && !Array.isArray(prop) ? prop as VPropertyTemporalType : null
	}

	get gender(): VPropertyGenderType | null {
		const prop = this.fetch('GENDER')
		return prop && !Array.isArray(prop) ? prop as VPropertyGenderType : null
	}

	get addresses(): VPropertyAddressType[] {
		const properties = this.fetch('ADR')
		if (!properties) return []
		return Array.isArray(properties)
			? properties as VPropertyAddressType[]
			: [properties as VPropertyAddressType]
	}

	get telephones(): VPropertyUriType[] {
		const properties = this.fetch('TEL')
		if (!properties) return []
		return Array.isArray(properties)
			? properties as VPropertyUriType[]
			: [properties as VPropertyUriType]
	}
}
