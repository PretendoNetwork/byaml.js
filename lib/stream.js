class Stream {
	/**
	 * 
	 * @param {Buffer} buffer Buffer object
	 * @param {Connection} connection NEX connection
	 */
	constructor(buffer) {
		this._buffer = buffer;
		this._offset = 0;
		this.be = false;
	}

	/**
	 *
	 * @param {number} offset New offset to read from
	 */
	seek(offset) {
		this._offset = offset;
	}

	skip(length) {
		this._offset += length;
	}

	tell() {
		return this._offset;
	}

	/**
	 *
	 * @param {number} len Bytes to read
	 * @returns {Buffer} Read bytes
	 */
	read(len) {
		const read = this._buffer.subarray(this._offset, this._offset + len);
		this._offset += len;

		return read;
	}

	/**
	 *
	 * @param {number} len Bytes to read
	 * @returns {Buffer} Read bytes
	 */
	readBytes(len) {
		return this.read(len);
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt8() {
		return this.readBytes(1).readUInt8();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt16BE() {
		return this.readBytes(2).readUInt16BE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt16LE() {
		return this.readBytes(2).readUInt16LE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt16() {
		if (this.be) {
			return this.readUInt16BE();
		} else {
			return this.readUInt16LE();
		}
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt24BE() {
		return this.readBytes(3).readUIntBE(0, 3);
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt24LE() {
		return this.readBytes(3).readUIntLE(0, 3);
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt24() {
		if (this.be) {
			return this.readUInt24BE();
		} else {
			return this.readUInt24LE();
		}
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt32BE() {
		return this.readBytes(4).readUInt32BE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt32LE() {
		return this.readBytes(4).readUInt32LE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt32() {
		if (this.be) {
			return this.readUInt32BE();
		} else {
			return this.readUInt32LE();
		}
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt32BE() {
		return this.readBytes(4).readInt32BE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt32LE() {
		return this.readBytes(4).readInt32LE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt32() {
		if (this.be) {
			return this.readInt32BE();
		} else {
			return this.readInt32LE();
		}
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt64BE() {
		return this.readBytes(8).readBigUInt64BE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt64LE() {
		return this.readBytes(8).readBigUInt64LE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readUInt64() {
		if (this.be) {
			return this.readUInt64BE();
		} else {
			return this.readUInt64LE();
		}
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt64BE() {
		return this.readBytes(8).readBigInt64BE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt64LE() {
		return this.readBytes(8).readBigInt64LE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readInt64() {
		if (this.be) {
			return this.readInt64BE();
		} else {
			return this.readInt64LE();
		}
	}

	/**
	 *
	 * @returns {number} Read double
	 */
	readDoubleBE() {
		return this.readBytes(8).readDoubleBE();
	}

	/**
	 *
	 * @returns {number} Read double
	 */
	readDoubleLE() {
		return this.readBytes(8).readDoubleLE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readDouble() {
		if (this.be) {
			return this.readDoubleBE();
		} else {
			return this.readDoubleLE();
		}
	}

	/**
	 *
	 * @returns {number} Read float
	 */
	readFloatBE() {
		return this.readBytes(4).readFloatBE();
	}

	/**
	 *
	 * @returns {number} Read float
	 */
	readFloatLE() {
		return this.readBytes(4).readFloatLE();
	}

	/**
	 *
	 * @returns {number} Read number
	 */
	readFloat() {
		if (this.be) {
			return this.readFloatBE();
		} else {
			return this.readFloatLE();
		}
	}

	/**
	 * @returns {string} string
	 */
	readString(length) {
		return this.readBytes(length).toString();
	}
}

module.exports = Stream;