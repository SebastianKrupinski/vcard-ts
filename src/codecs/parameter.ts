import { keepableSource } from './contentLine'
import { encodeParameterItem, decodeParameterItems } from './parameterValue'
import { createParameter, VParameterCollection, VParameterListObject, VParameterObject } from '../parameters/VParameterObject'
import type { VParameterCollectionInterface, VParameterListInterface, VParameterObjectInterface } from '../parameters/VParameterInterfaces'
import { parameterSources } from '../parameters/internal/parameterSources'

/** Consume leading ;NAME=value occurrences, leaving the :property-value suffix. */
export function decodeParameters(source: string): { params: VParameterCollectionInterface; remaining: string } {
	const params: VParameterCollectionInterface = new VParameterCollection()
	let remaining = source
	while (remaining.startsWith(';')) {
		const result = extractParameter(remaining.slice(1))
		if (!result) throw new Error(`Invalid property parameter: ${source}`)
		remaining = result.remainder.trimStart()
		const name = result.name.toUpperCase()
		params[name] = parseParameter(name, result.value, params[name])
	}
	if (!remaining.startsWith(':')) throw new Error(`Invalid property parameter: ${source}`)
	return { params, remaining }
}

export function encodeParameters(parameters: VParameterCollectionInterface): string {
	return Object.values(parameters).flatMap(parameter => {
		const name = parameter.name.toUpperCase()
		const source = parameter instanceof VParameterObject ? parameterSources.get(parameter) : undefined
		if (source) {
			return source.map(value => `${name}=${value}`)
		}

		const values = (parameter as Partial<VParameterListInterface>).list ?? [parameter.value]
		return values.length > 0 ? [`${name}=${values.map(encodeParameterItem).join(',')}`] : []
	}).join(';')
}

/** Decode one occurrence, preserving list items and original spelling. */
function parseParameter(name: string, source: string, existing?: VParameterObjectInterface): VParameterObject {
	const parameter = existing instanceof VParameterObject ? existing : createParameter(name)
	if (parameter !== existing) parameterSources.set(parameter, [])
	const previousSource = parameterSources.get(parameter)
	const items = decodeParameterItems(source)
	if (parameter instanceof VParameterListObject) {
		parameter.list = [...parameter.list, ...items]
	} else {
		const text = items.join(',')
		parameter.value = parameter.value === '' ? text : `${parameter.value},${text}`
	}
	const keepable = keepableSource(source)
	if (keepable !== null && previousSource !== undefined) {
		parameterSources.set(parameter, [...previousSource, keepable])
	}
	return parameter
}

/**
 * Extracts the first parameter from a vCard property string.
 *
 * @param data The vCard line starting with the parameter (e.g., 'TYPE=WORK;...').
 * @return An object with the name, value, and the new remainder, or null if no parameter is found.
 */
function extractParameter(data: string): { name: string; value: string; remainder: string } | null {
	// A parameter name, then one or more comma-separated values, each quoted or unquoted
	const paramRegex = /^([a-zA-Z0-9-]+)=((?:"[^"]*"|[^;:,]*)(?:,(?:"[^"]*"|[^;:,]*))*)/

	const match = data.match(paramRegex)

	if (match && match[2].length > 0) {
		return { name: match[1], value: match[2], remainder: data.substring(match[0].length) }
	}

	// No parameter found at the start of the string
	return null
}
