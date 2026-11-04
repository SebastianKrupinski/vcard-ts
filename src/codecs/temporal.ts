export interface DateFields {
	year: number | null
	month: number | null
	day: number | null
}

export interface TimeFields {
	hour: number | null
	minute: number | null
	second: number | null
	offset: number | null // in minutes, 0 for Z, null for local
}

const DATE_PATTERNS = [
	/^(?<year>\d{4})-?(?<month>\d{2})-?(?<day>\d{2})$/,
	/^(?<year>\d{4})-(?<month>\d{2})$/,
	/^(?<year>\d{4})$/,
	/^--(?<month>\d{2})-?(?<day>\d{2})$/,
	/^--(?<month>\d{2})$/,
	/^---(?<day>\d{2})$/,
]

const ZONE = '(?<zone>Z|[+-]\\d{2}(?::?\\d{2})?)?'
const TIME_PATTERNS = [
	new RegExp(`^(?<hour>\\d{2})(?::?(?<minute>\\d{2})(?::?(?<second>\\d{2})(?:[.,]\\d+)?)?)?${ZONE}$`, 'i'),
	new RegExp(`^-(?<minute>\\d{2})(?::?(?<second>\\d{2}))?${ZONE}$`, 'i'),
	new RegExp(`^--(?<second>\\d{2})${ZONE}$`, 'i'),
]

function numberOrNull(value: string | undefined): number | null {
	return value === undefined ? null : Number(value)
}

function inRange(value: number | null, minimum: number, maximum: number): boolean {
	return value === null || (value >= minimum && value <= maximum)
}

function pad(value: number, length = 2): string {
	return String(value).padStart(length, '0')
}

/**
 * The original text worth keeping for a value. Text containing a line break
 * can't have come from a content line, and writing it back would let it start
 * a new property.
 */
export function keepableSource(value: string): string | null {
	return /[\r\n]/.test(value) ? null : value
}

/** Parse any supported date form, or return null if the text isn't a valid date. */
export function parseDate(value: string): DateFields | null {
	for (const pattern of DATE_PATTERNS) {
		const groups = value.match(pattern)?.groups
		if (!groups) continue

		const fields = {
			year: numberOrNull(groups.year),
			month: numberOrNull(groups.month),
			day: numberOrNull(groups.day),
		}
		return inRange(fields.month, 1, 12) && inRange(fields.day, 1, 31) ? fields : null
	}
	return null
}

function parseOffset(zone: string | undefined): number | null | undefined {
	if (zone === undefined) return null
	if (zone.toUpperCase() === 'Z') return 0

	const digits = zone.slice(1).replace(':', '')
	const hours = Number(digits.slice(0, 2))
	const minutes = Number(digits.slice(2) || 0)
	if (hours > 23 || minutes > 59) return undefined

	const offset = hours * 60 + minutes
	return zone[0] === '-' && offset !== 0 ? -offset : offset
}

/** Parse any supported time form, or return null if the text isn't a valid time. */
export function parseTime(value: string): TimeFields | null {
	const text = value.startsWith('T') ? value.slice(1) : value
	for (const pattern of TIME_PATTERNS) {
		const groups = text.match(pattern)?.groups
		if (!groups) continue

		const offset = parseOffset(groups.zone)
		if (offset === undefined) return null

		const fields = {
			hour: numberOrNull(groups.hour),
			minute: numberOrNull(groups.minute),
			second: numberOrNull(groups.second),
			offset,
		}
		return inRange(fields.hour, 0, 23) && inRange(fields.minute, 0, 59) && inRange(fields.second, 0, 60)
			? fields
			: null
	}
	return null
}

/** Format a date in the standard form: extended for vCard 3.0, basic for 4.0. */
export function formatDate({ year, month, day }: DateFields, extended: boolean): string {
	if (year === null && month === null && day === null) return ''
	if (year !== null && month === null && day !== null) {
		throw new Error('Invalid date value: a date with a year and day must also have a month')
	}

	const separator = extended ? '-' : ''
	if (year !== null) {
		if (month === null) return pad(year, 4)
		if (day === null) return `${pad(year, 4)}-${pad(month)}`
		return `${pad(year, 4)}${separator}${pad(month)}${separator}${pad(day)}`
	}
	if (month !== null) {
		return day === null ? `--${pad(month)}` : `--${pad(month)}${separator}${pad(day)}`
	}
	return `---${pad(day as number)}`
}

function formatOffset(offset: number | null, extended: boolean): string {
	if (offset === null) return ''
	if (offset === 0) return 'Z'

	const absolute = Math.abs(offset)
	const hours = pad(Math.floor(absolute / 60))
	const minutes = pad(absolute % 60)
	return `${offset > 0 ? '+' : '-'}${hours}${extended ? ':' : ''}${minutes}`
}

/** Format a time in the standard form: extended for vCard 3.0, basic for 4.0. */
export function formatTime({ hour, minute, second, offset }: TimeFields, extended: boolean): string {
	if (hour === null && minute === null && second === null) return ''
	if (hour !== null && minute === null && second !== null) {
		throw new Error('Invalid time value: a time with an hour and second must also have a minute')
	}

	const separator = extended ? ':' : ''
	let time: string
	if (hour !== null) {
		time = pad(hour)
		if (minute !== null) time += `${separator}${pad(minute)}`
		if (second !== null) time += `${separator}${pad(second)}`
	} else if (minute !== null) {
		time = `-${pad(minute)}`
		if (second !== null) time += `${separator}${pad(second)}`
	} else {
		time = `--${pad(second as number)}`
	}
	return time + formatOffset(offset, extended)
}
