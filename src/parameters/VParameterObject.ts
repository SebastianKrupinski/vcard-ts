import { VParameterCollectionInterface, VParameterObjectInterface } from "./VParameterInterfaces"

export class VParameterObject implements VParameterObjectInterface {

	name: string
	value: string

	constructor(name: string = '', value: string = '') {
		this.name = name
		this.value = value
	}

}

export class VParameterCollection implements VParameterCollectionInterface {

	[key: string]: VParameterObjectInterface

  	constructor(params: Array<{ name: string, value: string }> = []) {
		for (const param of params) {
			this[param.name] = new VParameterObject(param.name, param.value)
		}
	}

}
