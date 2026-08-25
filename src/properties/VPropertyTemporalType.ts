import { VParameterCollectionInterface } from '../parameters/VParameterInterfaces'
import { VParameterValueOptions } from '../parameters/VParameterTypes'
import { VPropertyBase } from './VPropertyBase'
import { VPropertyDateTimeValue } from './VPropertyDateTimeValue'
import { VPropertyDateValue } from './VPropertyDateValue'
import { VPropertyTimeValue } from './VPropertyTimeValue'
import { decodePropertyValue } from '../codecs/propertyValue'

export class VPropertyTemporalType extends VPropertyBase<VPropertyDateValue|VPropertyTimeValue|VPropertyDateTimeValue|string> {

	constructor(
	       name: string,
	       value?: string | VPropertyDateValue | VPropertyTimeValue | VPropertyDateTimeValue,
	       group?: string,
	       params?: VParameterCollectionInterface,
	) {
		if (typeof value === 'string') {
			// Try to get the VALUE parameter if present
			const paramValue = params?.VALUE?.value?.toUpperCase()
			function detectTemporalType(propertyValue: string, paramValue?: string): 'datetime' | 'date' | 'time' | 'text' {
				if (paramValue === VParameterValueOptions.TEXT) return 'text'
				if (paramValue === VParameterValueOptions.DATE_TIME) return 'datetime'
				if (paramValue === VParameterValueOptions.DATE) return 'date'
				if (paramValue === VParameterValueOptions.TIME) return 'time'
				if (propertyValue.startsWith('T')) {
					return 'time'
				} else if (propertyValue.includes('T')) {
					return 'datetime'
				} else {
					return 'date'
				}
			}

			const format = detectTemporalType(value, paramValue)
			if (format === 'datetime') {
				value = new VPropertyDateTimeValue().deserialize(value)
			} else if (format === 'date') {
				value = new VPropertyDateValue().deserialize(value)
			} else if (format === 'time') {
				value = new VPropertyTimeValue().deserialize(value)
			} else {
				value = decodePropertyValue(value)
			}
		}
		super(name, value, group, params)
	}

}
