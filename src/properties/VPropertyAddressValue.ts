import { VPropertyStructuredValue } from "./VPropertyStructuredValue"

const ADDRESS_FIELDS = [
	'poBox',
	'extended',
	'street',
	'locality',
	'region',
	'code',
	'country',
	'room',
	'apartment',
	'floor',
	'streetNumber',
	'streetName',
	'building',
	'block',
	'subdistrict',
	'district',
	'landmark',
	'direction',
] as const

export type VPropertyAddressField = typeof ADDRESS_FIELDS[number]

/**
 * An ADR value. Accessors such as `street` read the first item and replace the whole
 * list, while `getList('street')` exposes every item.
 */
export class VPropertyAddressValue extends VPropertyStructuredValue<VPropertyAddressField> {

	constructor(
		poBox?: string | string[],
		extended?: string | string[],
		street?: string | string[],
		locality?: string | string[],
		region?: string | string[],
		code?: string | string[],
		country?: string | string[],
	) {
		super(ADDRESS_FIELDS, 7, [poBox, extended, street, locality, region, code, country])
	}

	get poBox(): string | null {
		return this.getList('poBox')[0] || null
	}

	set poBox(poBox: string | null) {
		this.setList('poBox', poBox)
	}

	get extended(): string | null {
		return this.getList('extended')[0] || null
	}

	set extended(extended: string | null) {
		this.setList('extended', extended)
	}

	get street(): string | null {
		return this.getList('street')[0] || null
	}

	set street(street: string | null) {
		this.setList('street', street)
	}

	get locality(): string | null {
		return this.getList('locality')[0] || null
	}

	set locality(locality: string | null) {
		this.setList('locality', locality)
	}

	get region(): string | null {
		return this.getList('region')[0] || null
	}

	set region(region: string | null) {
		this.setList('region', region)
	}

	get code(): string | null {
		return this.getList('code')[0] || null
	}

	set code(code: string | null) {
		this.setList('code', code)
	}

	get country(): string | null {
		return this.getList('country')[0] || null
	}

	set country(country: string | null) {
		this.setList('country', country)
	}

	get room(): string | null {
		return this.getList('room')[0] || null
	}

	set room(room: string | null) {
		this.setList('room', room)
	}

	get apartment(): string | null {
		return this.getList('apartment')[0] || null
	}

	set apartment(apartment: string | null) {
		this.setList('apartment', apartment)
	}

	get floor(): string | null {
		return this.getList('floor')[0] || null
	}

	set floor(floor: string | null) {
		this.setList('floor', floor)
	}

	get streetNumber(): string | null {
		return this.getList('streetNumber')[0] || null
	}

	set streetNumber(streetNumber: string | null) {
		this.setList('streetNumber', streetNumber)
	}

	get streetName(): string | null {
		return this.getList('streetName')[0] || null
	}

	set streetName(streetName: string | null) {
		this.setList('streetName', streetName)
	}

	get building(): string | null {
		return this.getList('building')[0] || null
	}

	set building(building: string | null) {
		this.setList('building', building)
	}

	get block(): string | null {
		return this.getList('block')[0] || null
	}

	set block(block: string | null) {
		this.setList('block', block)
	}

	get subdistrict(): string | null {
		return this.getList('subdistrict')[0] || null
	}

	set subdistrict(subdistrict: string | null) {
		this.setList('subdistrict', subdistrict)
	}

	get district(): string | null {
		return this.getList('district')[0] || null
	}

	set district(district: string | null) {
		this.setList('district', district)
	}

	get landmark(): string | null {
		return this.getList('landmark')[0] || null
	}

	set landmark(landmark: string | null) {
		this.setList('landmark', landmark)
	}

	get direction(): string | null {
		return this.getList('direction')[0] || null
	}

	set direction(direction: string | null) {
		this.setList('direction', direction)
	}

}
