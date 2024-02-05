export default class Stream {
	private buffer: Buffer;
	private position: number;
	public be: boolean;

	constructor(buffer: Buffer) {
		this.buffer = buffer;
		this.position = 0;
		this.be = false;
	}

	seek(position: number): void {
		this.position = position;
	}

	skip(length: number): void {
		this.position += length;
	}

	tell(): number {
		return this.position;
	}

	read(length: number): Buffer {
		const read = this.buffer.subarray(this.position, this.position + length);
		this.position += length;

		return read;
	}

	readBytes(length: number): Buffer {
		return this.read(length);
	}

	readUInt8(): number {
		return this.readBytes(1).readUInt8();
	}

	readUInt16BE(): number {
		return this.readBytes(2).readUInt16BE();
	}

	readUInt16LE(): number {
		return this.readBytes(2).readUInt16LE();
	}

	readUInt16(): number {
		if (this.be) {
			return this.readUInt16BE();
		} else {
			return this.readUInt16LE();
		}
	}

	readUInt24BE(): number {
		return this.readBytes(3).readUIntBE(0, 3);
	}

	readUInt24LE(): number {
		return this.readBytes(3).readUIntLE(0, 3);
	}

	readUInt24(): number {
		if (this.be) {
			return this.readUInt24BE();
		} else {
			return this.readUInt24LE();
		}
	}

	readUInt32BE(): number {
		return this.readBytes(4).readUInt32BE();
	}

	readUInt32LE(): number {
		return this.readBytes(4).readUInt32LE();
	}

	readUInt32(): number {
		if (this.be) {
			return this.readUInt32BE();
		} else {
			return this.readUInt32LE();
		}
	}

	readInt32BE(): number {
		return this.readBytes(4).readInt32BE();
	}

	readInt32LE(): number {
		return this.readBytes(4).readInt32LE();
	}

	readInt32(): number {
		if (this.be) {
			return this.readInt32BE();
		} else {
			return this.readInt32LE();
		}
	}

	readUInt64BE(): bigint {
		return this.readBytes(8).readBigUInt64BE();
	}

	readUInt64LE(): bigint {
		return this.readBytes(8).readBigUInt64LE();
	}

	readUInt64(): bigint {
		if (this.be) {
			return this.readUInt64BE();
		} else {
			return this.readUInt64LE();
		}
	}

	readInt64BE(): bigint {
		return this.readBytes(8).readBigInt64BE();
	}

	readInt64LE(): bigint {
		return this.readBytes(8).readBigInt64LE();
	}

	readInt64(): bigint {
		if (this.be) {
			return this.readInt64BE();
		} else {
			return this.readInt64LE();
		}
	}

	readDoubleBE(): number {
		return this.readBytes(8).readDoubleBE();
	}

	readDoubleLE(): number {
		return this.readBytes(8).readDoubleLE();
	}

	readDouble(): number {
		if (this.be) {
			return this.readDoubleBE();
		} else {
			return this.readDoubleLE();
		}
	}

	readFloatBE(): number {
		return this.readBytes(4).readFloatBE();
	}

	readFloatLE(): number {
		return this.readBytes(4).readFloatLE();
	}

	readFloat(): number {
		if (this.be) {
			return this.readFloatBE();
		} else {
			return this.readFloatLE();
		}
	}

	readString(length: number): string {
		return this.readBytes(length).toString();
	}
}