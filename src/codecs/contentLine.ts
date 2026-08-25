const encoder = new TextEncoder()

export function normalizeNewlines(value: string): string {
	return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

export function foldContentLine(line: string, newline = '\r\n'): string {
	const lines: string[] = []
	let remaining = line
	let firstLine = true

	while (encoder.encode(remaining).length > (firstLine ? 75 : 74)) {
		const limit = firstLine ? 75 : 74
		const [part, rest] = takeBytePrefix(remaining, limit)
		lines.push(firstLine ? part : ` ${part}`)
		remaining = rest
		firstLine = false
	}

	lines.push(firstLine ? remaining : ` ${remaining}`)
	return lines.join(newline)
}

export function unfoldContentLines(value: string): string[] {
	const unfolded: string[] = []
	for (const line of normalizeNewlines(value).split('\n')) {
		if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
			unfolded[unfolded.length - 1] += line.slice(1)
		} else {
			unfolded.push(line)
		}
	}
	return unfolded
}

function takeBytePrefix(value: string, limit: number): [string, string] {
	let bytes = 0
	let end = 0
	for (const character of value) {
		const characterBytes = encoder.encode(character).length
		if (bytes + characterBytes > limit) break
		bytes += characterBytes
		end += character.length
	}
	return [value.slice(0, end), value.slice(end)]
}
