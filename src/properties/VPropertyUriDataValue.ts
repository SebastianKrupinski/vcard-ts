export class VPropertyUriDataValue {

	private _data: string | null = null
	private _format: string | null = null
	private _encoding: string | null = null

	constructor(data?: string, format?: string | null, encoding?: string | null) {
		this._data = data ?? null
		this._format = format ?? null
		this._encoding = encoding ?? null
	}

	deserialize(value: string): VPropertyUriDataValue {
		// Format: data:[<mimetype>][;base64],<data>
		// PHOTO:data:image/jpeg;base64,MIICajCCAdOgAwIBAgICBEUwDQYJKoZIhv
		if (value.startsWith('data:')) {
			const payload = value.substring(5)
			const separator = payload.indexOf(',')
			const metadata = separator === -1 ? payload : payload.slice(0, separator)
			const meta = metadata.split(';')
			this._format = meta[0] || null
			this._encoding = meta.slice(1).join(';') || null
			this._data = separator === -1 ? null : payload.slice(separator + 1)
		} else {
			this._data = value
		}
		return this
	}

	serialize(): string {
		return 'data:' + this._format + ';' + this._encoding + ',' + this._data
	}

	get data(): string | null {
		return this._data
	}

	set data(value: string | null) {
		this._data = value
	}

	get format(): string | null {
		return this._format
	}

	set format(value: string | null) {
		this._format = value
	}

	get encoding(): string | null {
		return this._encoding
	}

	set encoding(value: string | null) {
		this._encoding = value
	}

}
