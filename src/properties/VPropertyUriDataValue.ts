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
			const parts = value.substring(5).split(',')
			const meta = parts[0].split(';')
			this._format = meta[0] || null
			this._encoding = meta[1] || null
			this._data = parts[1] || null
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
