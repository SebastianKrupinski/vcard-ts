export function decodePropertyValue(value: string): string {
	let decoded = ''
	for (let index = 0; index < value.length; index++) {
		const character = value[index]
		if (character !== '\\' || index === value.length - 1) {
			decoded += character
			continue
		}

		const escaped = value[++index]
		if (escaped.toLowerCase() === 'n') decoded += '\n'
		else if (escaped === '\\' || escaped === ',' || escaped === ';') decoded += escaped
		else decoded += `\\${escaped}`
	}
	return decoded
}

export function splitPropertyValue(value: string, delimiter: string): string[] {
	const parts: string[] = []
	let current = ''
	for (let index = 0; index < value.length; index++) {
		const character = value[index]
		if (character === '\\' && index < value.length - 1) {
			current += character + value[++index]
		} else if (character === delimiter) {
			parts.push(current)
			current = ''
		} else {
			current += character
		}
	}
	parts.push(current)
	return parts
}
