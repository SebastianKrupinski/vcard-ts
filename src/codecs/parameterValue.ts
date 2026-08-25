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
