export function decodeParameterValue(value: string): string {
	let decoded = ''
	for (let index = 0; index < value.length; index++) {
		if (value[index] !== '^' || index === value.length - 1) {
			decoded += value[index]
			continue
		}

		const escaped = value[++index]
		if (escaped === '^') decoded += '^'
		else if (escaped === "'") decoded += '"'
		else if (escaped.toLowerCase() === 'n') decoded += '\n'
		else decoded += `^${escaped}`
	}
	return decoded
}

export function encodeParameterValue(value: string): string {
	return value
		.replace(/\^/g, '^^')
		.replace(/\n/g, '^n')
		.replace(/"/g, "^'")
}

function splitOnUnquotedCommas(value: string): string[] {
	const items: string[] = []
	let current = ''
	let inQuotes = false
	for (const character of value) {
		if (character === '"') inQuotes = !inQuotes
		if (character === ',' && !inQuotes) {
			items.push(current)
			current = ''
		} else {
			current += character
		}
	}
	items.push(current)
	return items
}

function decodeSourceItem(item: string): string {
	const unquoted = item.length >= 2 && item.startsWith('"') && item.endsWith('"')
		? item.slice(1, -1)
		: item
	return decodeParameterValue(unquoted)
}

/** Decode one parameter's text as written in a content line, such as "a","b". */
export function parseParameterItems(source: string): string[] {
	return splitOnUnquotedCommas(source).map(decodeSourceItem)
}

export function encodeParameterItem(value: string): string {
	const encoded = encodeParameterValue(value)
	return /[,:;]/.test(encoded) ? `"${encoded}"` : encoded
}
