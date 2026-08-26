import { VPropertyAddressType } from './properties/VPropertyAddressType'
import { VPropertyGenderType } from './properties/VPropertyGenderType'
import { VPropertyGeoType } from './properties/VPropertyGeoType'
import { VPropertyMediaType } from './properties/VPropertyMediaType'
import { VPropertyBaseInterface, VPropertyCollectionInterface } from './properties/VPropertyInterfaces'
import { VPropertyNameType } from './properties/VPropertyNameType'
import { VPropertyOrganizationType } from './properties/VPropertyOrganizationType'
import { VPropertyStringCollectionType } from './properties/VPropertyStringCollectionType'
import { VPropertyTemporalType } from './properties/VPropertyTemporalType'
import { VPropertyTextType } from './properties/VPropertyTextType'
import { VPropertyTextOrUriType } from './properties/VPropertyTextOrUriType'
import { VPropertyTimeZoneType } from './properties/VPropertyTimeZoneType'
import { VPropertyUriOrTextType } from './properties/VPropertyUriOrTextType'
import { VPropertyUriType } from './properties/VPropertyUriType'
import {
	VCardInterface,
	VCardPropertyVersionValues,
} from './VCardInterfaces'

export class VCard implements VCardInterface {

	private _version: VCardPropertyVersionValues = VCardPropertyVersionValues.V3_0
	properties: VPropertyCollectionInterface

	constructor(version: VCardPropertyVersionValues = VCardPropertyVersionValues.V3_0, properties: VPropertyCollectionInterface = []) {
		this._version = version
		this.properties = properties
	}

	add(value: VPropertyBaseInterface): void {
		this.properties.push(value)
	}

	/** Return the first property with this name, or null when it is absent. */
	first(name: string): VPropertyBaseInterface | null {
		return this.properties.find(property => property.name.toUpperCase() === name.toUpperCase()) ?? null
	}

	/** Return every property with this name in source order. */
	all(name: string): VPropertyBaseInterface[] {
		return this.properties.filter(property => property.name.toUpperCase() === name.toUpperCase())
	}

	findById(id: string): VPropertyBaseInterface | null {
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
		return this.first('PRODID') as VPropertyTextType | null
	}

	get uid(): VPropertyUriOrTextType | null {
		return this.first('UID') as VPropertyUriOrTextType | null
	}

	get revision(): VPropertyTemporalType | null {
		return this.first('REV') as VPropertyTemporalType | null
	}

	get kind(): VPropertyTextType | null {
		return this.first('KIND') as VPropertyTextType | null
	}

	get name(): VPropertyNameType | null {
		return this.first('N') as VPropertyNameType | null
	}

	get formattedName(): VPropertyTextType | null {
		return this.first('FN') as VPropertyTextType | null
	}

	get birthDay(): VPropertyTemporalType | null {
		return this.first('BDAY') as VPropertyTemporalType | null
	}

	get birthPlace(): VPropertyTextOrUriType | null {
		return this.first('BIRTHPLACE') as VPropertyTextOrUriType | null
	}

	get deathDay(): VPropertyTemporalType | null {
		return this.first('DEATHDATE') as VPropertyTemporalType | null
	}

	get deathPlace(): VPropertyTextOrUriType | null {
		return this.first('DEATHPLACE') as VPropertyTextOrUriType | null
	}

	get anniversary(): VPropertyTemporalType | null {
		return this.first('ANNIVERSARY') as VPropertyTemporalType | null
	}

	get gender(): VPropertyGenderType | null {
		return this.first('GENDER') as VPropertyGenderType | null
	}

	get addresses(): VPropertyAddressType[] {
		return this.all('ADR') as VPropertyAddressType[]
	}

	get telephones(): VPropertyTextOrUriType[] {
		return this.all('TEL') as VPropertyTextOrUriType[]
	}

	get emails(): VPropertyTextType[] {
		return this.all('EMAIL') as VPropertyTextType[]
	}

	get nicknames(): VPropertyStringCollectionType[] {
		return this.all('NICKNAME') as VPropertyStringCollectionType[]
	}

	get photos(): VPropertyMediaType[] {
		return this.all('PHOTO') as VPropertyMediaType[]
	}

	get organizations(): VPropertyOrganizationType[] {
		return this.all('ORG') as VPropertyOrganizationType[]
	}

	get titles(): VPropertyTextType[] {
		return this.all('TITLE') as VPropertyTextType[]
	}

	get roles(): VPropertyTextType[] {
		return this.all('ROLE') as VPropertyTextType[]
	}

	get notes(): VPropertyTextType[] {
		return this.all('NOTE') as VPropertyTextType[]
	}

	get urls(): VPropertyUriType[] {
		return this.all('URL') as VPropertyUriType[]
	}

	get instantMessaging(): VPropertyUriType[] {
		return this.all('IMPP') as VPropertyUriType[]
	}

	get languages(): VPropertyTextType[] {
		return this.all('LANG') as VPropertyTextType[]
	}

	get timeZones(): VPropertyTimeZoneType[] {
		return this.all('TZ') as VPropertyTimeZoneType[]
	}

	get geoLocations(): VPropertyGeoType[] {
		return this.all('GEO') as VPropertyGeoType[]
	}

	get categories(): VPropertyStringCollectionType[] {
		return this.all('CATEGORIES') as VPropertyStringCollectionType[]
	}
}
