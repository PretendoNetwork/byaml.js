const { getDataFromPathOrBuffer } = require('./util');
const { NODE_TYPES, NODE_NAMES } = require('./nodes');
const Stream = require('./stream');

class BYAML extends Stream {
	constructor(pathOrBuffer) {
		const data = getDataFromPathOrBuffer(pathOrBuffer);

		super(data);

		this.magic = this.readString(2);

		this.be = this.magic === 'BY';

		this.version = this.readUInt16();

		this.keyTableOffset = this.readUInt32();
		this.stringTableOffset = this.readUInt32();

		/*
		* This is only ever seen in MK8
		TODO - Figure out how to detect MK8?
		if (this.version === 1) {
			this.binaryDataTableOffset = this.readUInt32();
		}
		*/

		this.rootNodeOffset = this.readUInt32();

		this.seek(this.keyTableOffset);
		this.keyTable = this.parseNode();

		this.seek(this.stringTableOffset);
		this.stringTable = this.parseNode();

		this.seek(this.rootNodeOffset);
		this.rootNode = this.parseNode();
	}

	parseNode(optionalType) {
		const type = optionalType || this.readUInt8();
		const node = {
			type,
			name: NODE_NAMES[type]
		};

		switch (type) {
			case NODE_TYPES.STRING:
				const stringTableIndex = this.readUInt32();
				node.value = this.stringTable.value[stringTableIndex];
				break;
			case NODE_TYPES.BINARY_DATA:
				if (this.version < 4) {
					throw new Error(`Got binary data node type on unsupported version. Only support on versions 4+, got ${this.version}`);
				}
				node.value = this.readBinaryData();
				break;
			case NODE_TYPES.BINARY_DATA_WITH_PARAM:
				if (this.version < 5) {
					throw new Error(`Got binary data (with param) node type on unsupported version. Only support on version 5, got ${this.version}`);
				}
				node.value = this.readBinaryDataWithParam();
				break;
			case NODE_TYPES.ARRAY:
				node.value = this.readArray();
				break;
			case NODE_TYPES.DICTIONARY:
				node.value = this.readDictionary();
				break;
			case NODE_TYPES.STRING_TABLE:
				node.value = this.readStringTable();
				break;
			case NODE_TYPES.BOOL:
				node.value = this.readBoolean();
				break;
			case NODE_TYPES.INT32:
				node.value = this.readInt32();
				break;
			case NODE_TYPES.FLOAT:
				node.value = this.readFloat();
				break;
			case NODE_TYPES.UINT32:
				if (this.version < 2) {
					throw new Error(`Got uint32 node type on unsupported version. Only support on versions 2+, got ${this.version}`);
				}
				node.value = this.readUInt32();
				break;
			case NODE_TYPES.INT64:
				if (this.version < 3) {
					throw new Error(`Got int64 node type on unsupported version. Only support on versions 3+, got ${this.version}`);
				}
				node.value = this.readUInt32();
				break;
			case NODE_TYPES.UINT64:
				if (this.version < 3) {
					throw new Error(`Got uint64 node type on unsupported version. Only support on versions 3+, got ${this.version}`);
				}
				node.value = this.readUInt32();
				break;
			case NODE_TYPES.DOUBLE:
				if (this.version < 3) {
					throw new Error(`Got double node type on unsupported version. Only support on versions 3+, got ${this.version}`);
				}
				node.value = this.readUInt32();
				break;
			case NODE_TYPES.NULL:
				node.value = 0; // * NULL nodes are always 0
				break;
			default:
				throw new Error(`Unsupported node type: 0x${type.toString(16)}`);
		}

		return node;
	}

	readBinaryData() {
		const offset = this.readUInt32();
		const back = this.tell();

		this.seek(offset);

		const length = this.readUInt32();
		const binaryData = this.readBytes(length);

		this.seek(back);

		return binaryData;
	}

	readBinaryDataWithParam() {
		const offset = this.readUInt32();
		this.skip(4); // * Skip unknown
		const back = this.tell();

		this.seek(offset);

		const length = this.readUInt32();
		const binaryData = this.readBytes(length);

		this.seek(back);

		return binaryData;
	}

	readArray() {
		const types = [];
		const array = [];

		const length = this.readUInt24();

		for (let i = 0; i < length; i++) {
			const type = this.readUInt8();
			types.push(type)
		}

		const alignedSize = align(length, 4);
		const paddingDifference = alignedSize - length;

		this.skip(paddingDifference); // * The types table is aligned with padding to a multiple of 4

		for (const type of types) {
			const back = this.tell() + 4; // * 4 = the value length

			if (type === NODE_TYPES.ARRAY || type === NODE_TYPES.DICTIONARY) {
				const offset = this.readUInt32();
				this.seek(offset + 1); // * Skip the node type byte
			}

			array.push(this.parseNode(type));

			this.seek(back);
		}

		return array;
	}

	readDictionary() {
		const dictionary = {};

		const length = this.readUInt24();

		for (let i = 0; i < length; i++) {
			const keyTableIndex = this.readUInt24();
			const nodeType = this.readUInt8();

			const back = this.tell() + 4; // * 4 = the value length

			if (nodeType === NODE_TYPES.ARRAY || nodeType === NODE_TYPES.DICTIONARY) {
				const offset = this.readUInt32();
				this.seek(offset + 1); // * Skip the node type byte
			}

			const key = this.keyTable.value[keyTableIndex];
			dictionary[key] = this.parseNode(nodeType);

			this.seek(back);
		}

		return dictionary;
	}

	readStringTable() {
		const strings = [];

		const length = this.readUInt24();

		const tableOffset = this.tell() - 1 - 3; // * 1 = Node type, 3 = table length

		for (let i = 0; i < length; i++) {
			const relativeOffset = this.readUInt32();
			const stringOffset = tableOffset + relativeOffset;

			const back = this.tell();

			this.seek(stringOffset);

			const string = this.readStringNT();

			strings.push(string);

			this.seek(back);
		}

		return strings;
	}

	readBoolean() {
		// * In BYMAL files Booleans are always stored as uint32's
		return Boolean(this.readUInt32());
	}

	readInt64() {
		const offset = this.readUInt32();
		const back = this.tell();

		this.seek(offset);

		const value = super.readInt64(); // * Call the real function

		this.seek(back);

		return value;
	}

	readUInt64() {
		const offset = this.readUInt32();
		const back = this.tell();

		this.seek(offset);

		const value = super.readUInt64(); // * Call the real function

		this.seek(back);

		return value;
	}

	readDouble() {
		const offset = this.readUInt32();
		const back = this.tell();

		this.seek(offset);

		const value = super.readDouble(); // * Call the real function

		this.seek(back);

		return value;
	}

	/**
	 * @returns {string} string
	 */
	readStringNT() {
		const chars = [];
		let char = this.readUInt8();

		while (char !== 0x00) {
			chars.push(char);
			char = this.readUInt8();
		}

		return Buffer.from(chars).toString();
	}
}

function align(value, size) {
	return value + (size - value % size) % size;
}

module.exports = BYAML;