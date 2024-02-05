import fs from 'node:fs';
import Stream from '@/stream';
import Node from '@/types/nodes/node';
import { StringNode } from './types/nodes/string';
import { BinaryDataNode } from './types/nodes/binary-data';
import { BinaryDataWithParamNode } from './types/nodes/binary-data-with-param';
import { ArrayNode } from './types/nodes/array';
import { DictionaryNode } from './types/nodes/dictionary';
import { StringTableNode } from './types/nodes/string-table';
import { BinaryTableNode } from './types/nodes/binary-table';
import { BoolNode } from './types/nodes/bool';
import { IntegerNode } from './types/nodes/integer';
import { FloatNode } from './types/nodes/float';
import { UnsignedIntegerNode } from './types/nodes/unsigned-integer';
import { Integer64Node } from './types/nodes/integer64';
import { UnsignedInteger64Node } from './types/nodes/unsigned-integer64';
import { DoubleNode } from './types/nodes/double';
import { NullNode } from './types/nodes/null';
import { RootNode } from '@/types/nodes/root';
import { NodeTypes } from './types/nodes/types';

const MAGIC_BE = Buffer.from('BY');
const MAGIC_LE = Buffer.from('YB');

export default class BYAML {
	private stream: Stream;
	private dictionaryKeyTable: StringTableNode;
	private stringTable: StringTableNode;
	private binaryDataTable: BinaryTableNode; // * Only seen in older versions
	public version: number;
	public rootNode: RootNode;

	parseFromFile(path: string): void {
		const fileData = fs.readFileSync(path);

		this.stream = new Stream(fileData);

		this.#parseHeader();
	}

	#parseHeader(): void {
		const magic = this.stream.readBytes(2);

		if (!magic.equals(MAGIC_BE) && !magic.equals(MAGIC_LE)) {
			throw new Error(`Invalid BYAML magic. Expected either BY (big endian) or YB (little endian). Got ${magic.toString()}`);
		}

		if (magic.equals(MAGIC_BE)) {
			this.stream.be = true;
		} else {
			this.stream.be = false;
		}

		this.version = this.stream.readUInt16();

		const dictionaryKeyTableOffset = this.stream.readUInt32();
		const stringTableOffset = this.stream.readUInt32();
		let binaryDataTableOffset = 0;

		// * Binary data table offset only exists in versions before v4
		if (this.version > 4) {
			// * Some games, like Splatoon, do not update the BYAML version number.
			// * To account for these cases check the offset of this table.
			if (dictionaryKeyTableOffset !== 0x10) {
				binaryDataTableOffset = this.stream.readUInt32();
			}
		}

		const rootNodeOffset = this.stream.readUInt32();

		this.stream.seek(dictionaryKeyTableOffset+1); // * Skip the type byte
		this.dictionaryKeyTable = this.#readStringTableNode();

		this.stream.seek(stringTableOffset+1); // * Skip the type byte
		this.stringTable = this.#readStringTableNode();

		if (binaryDataTableOffset) {
			this.stream.seek(binaryDataTableOffset+1); // * Skip the type byte
			this.binaryDataTable = this.#readBinaryTableNode();
		}

		this.stream.seek(rootNodeOffset);
		const rootNode = this.#readNode();

		if (rootNode.type !== NodeTypes.ARRAY && rootNode.type !== NodeTypes.DICTIONARY) {
			throw new Error(`Invalid root node type. Expected either 0xC0 (Array) or 0xC1 (Dictionary). Got 0x${rootNode.type.toString(16).toUpperCase()}`);
		}

		this.rootNode = rootNode as RootNode; // TODO - Can this "as" call be removed?
	}

	#readNode(): Node {
		const nodeType = this.stream.readUInt8();

		switch (nodeType) {
			case NodeTypes.STRING:
				return this.#readStringNode();
			case NodeTypes.BINARY_DATA:
				return this.#readBinaryDataNode();
			case NodeTypes.BINARY_DATA_WITH_PARAM:
				return this.#readBinaryDataWithParamNode();
			case NodeTypes.ARRAY:
				return this.#readArrayNode();
			case NodeTypes.DICTIONARY:
				return this.#readDictionaryNode();
			case NodeTypes.STRING_TABLE:
				return this.#readStringTableNode();
			case NodeTypes.BINARY_TABLE:
				return this.#readBinaryTableNode();
			case NodeTypes.BOOL:
				return this.#readBoolNode();
			case NodeTypes.INT32:
				return this.#readIntegerNode();
			case NodeTypes.FLOAT:
				return this.#readFloatNode();
			case NodeTypes.UINT32:
				return this.#readUnsignedIntegerNode();
			case NodeTypes.INT64:
				return this.#readInteger64Node();
			case NodeTypes.UINT64:
				return this.#readUnsignedInteger64Node();
			case NodeTypes.DOUBLE:
				return this.#readDoubleNode();
			case NodeTypes.NULL:
				return this.#readNullNode();
			default:
				throw new Error(`Invalid node type. Got 0x${nodeType.toString(16).toUpperCase()}`);
		}
	}

	#readStringNode(): StringNode {
		// TODO - Implement this
		throw new Error('StringNodes not implemented');

		return {
			type: NodeTypes.STRING,
			value: ''
		};
	}

	#readBinaryDataNode(): BinaryDataNode {
		// TODO - Implement this
		throw new Error('BinaryDataNodes not implemented');

		return {
			type: NodeTypes.BINARY_DATA,
			value: Buffer.alloc(0)
		};
	}

	#readBinaryDataWithParamNode(): BinaryDataWithParamNode {
		// TODO - Implement this
		throw new Error('BinaryDataWithParamNodes not implemented');

		return {
			type: NodeTypes.BINARY_DATA_WITH_PARAM,
			value: Buffer.alloc(0)
		};
	}

	#readArrayNode(): ArrayNode {
		const count = this.stream.readUInt24();
		const typeTable: number[] = [];

		for (let i = 0; i < count; i++) {
			const nodeType = this.stream.readUInt8();

			typeTable.push(nodeType);
		}

		const elements: Node[] = [];

		for (const nodeType of typeTable) {
			const value = this.stream.readUInt32();

			// * Values for container nodes are offsets to the node relative to the start of the file
			if (nodeType === NodeTypes.ARRAY || nodeType === NodeTypes.DICTIONARY) {
				const before = this.stream.tell();

				this.stream.seek(value);

				elements.push(this.#readNode());

				this.stream.seek(before);

				continue;
			}

			// * Values for string nodes are indexes into the string table
			if (nodeType === NodeTypes.STRING) {
				elements.push({
					type: NodeTypes.STRING,
					value: this.stringTable.value[value]
				});

				continue;
			}

			// * All other nodes are just their value. Handle some special cases
			if (nodeType === NodeTypes.BOOL) {
				elements.push({
					type: NodeTypes.BOOL,
					value: !!value
				});

				continue;
			}

			if (nodeType === NodeTypes.NULL) {
				elements.push({
					type: NodeTypes.NULL,
					value: null
				});

				continue;
			}

			elements.push({ type: nodeType, value });
		}

		return {
			type: NodeTypes.ARRAY,
			value: elements
		};
	}

	#readDictionaryNode(): DictionaryNode {
		const count = this.stream.readUInt24();
		const map: Record<string, Node> = {};

		for (let i = 0; i < count; i++) {
			const keyIndex = this.stream.readUInt24();
			const nodeType = this.stream.readUInt8();
			const value = this.stream.readUInt32();
			const key = this.dictionaryKeyTable.value[keyIndex];

			// * Values for container nodes, and new number nodes, are offsets to the node relative to the start of the file
			if (
				nodeType === NodeTypes.ARRAY ||
				nodeType === NodeTypes.DICTIONARY ||
				nodeType === NodeTypes.INT64 ||
				nodeType === NodeTypes.UINT64 ||
				nodeType === NodeTypes.DOUBLE
			) {
				const before = this.stream.tell();

				this.stream.seek(value);

				map[key] = this.#readNode();

				this.stream.seek(before);

				continue;
			}

			// * Values for string nodes are indexes into the string table
			if (nodeType === NodeTypes.STRING) {
				map[key] = {
					type: NodeTypes.STRING,
					value: this.stringTable.value[value]
				};

				continue;
			}

			// * All other nodes are just their value. Handle some special cases
			if (nodeType === NodeTypes.BOOL) {
				map[key] = {
					type: NodeTypes.BOOL,
					value: !!value
				};

				continue;
			}

			if (nodeType === NodeTypes.NULL) {
				map[key] = {
					type: NodeTypes.NULL,
					value: null
				};

				continue;
			}

			map[key] = { type: nodeType, value };
		}

		return {
			type: NodeTypes.DICTIONARY,
			value: map
		};
	}

	#readStringTableNode(): StringTableNode {
		const count = this.stream.readUInt24() + 1;
		const offsetStart = this.stream.tell() - 4; // * Addresses of strings are relative to the start of the node

		const addressTable: number[] = [];

		for (let i = 0; i < count; i++) {
			const offset = this.stream.readUInt32();
			const address = offsetStart + offset;

			addressTable.push(address);
		}

		const strings: string[] = [];

		for (const address of addressTable) {
			this.stream.seek(address);

			const chars = [];
			let byte = this.stream.readUInt8();

			while (byte !== 0) {
				chars.push(byte);
				byte = this.stream.readUInt8();
			}

			strings.push(Buffer.from(chars).toString());
		}

		return {
			type: NodeTypes.STRING_TABLE,
			value: strings
		};
	}

	#readBinaryTableNode(): BinaryTableNode {
		// TODO - Implement this
		throw new Error('BinaryTableNodes not implemented');

		return {
			type: NodeTypes.BINARY_TABLE,
			value: []
		};
	}

	#readBoolNode(): BoolNode {
		// TODO - Implement this
		throw new Error('BoolNodes not implemented');

		return {
			type: NodeTypes.BOOL,
			value: false
		};
	}

	#readIntegerNode(): IntegerNode {
		// TODO - Implement this
		throw new Error('IntegerNodes not implemented');

		return {
			type: NodeTypes.INT32,
			value: 0
		};
	}

	#readFloatNode(): FloatNode {
		// TODO - Implement this
		throw new Error('FloatNodes not implemented');

		return {
			type: NodeTypes.FLOAT,
			value: 0
		};
	}

	#readUnsignedIntegerNode(): UnsignedIntegerNode {
		// TODO - Implement this
		throw new Error('UnsignedIntegerNodes not implemented');

		return {
			type: NodeTypes.UINT32,
			value: 0
		};
	}

	#readInteger64Node(): Integer64Node {
		// TODO - Implement this
		throw new Error('Integer64Nodes not implemented');

		return {
			type: NodeTypes.INT64,
			value: BigInt(0)
		};
	}

	#readUnsignedInteger64Node(): UnsignedInteger64Node {
		// TODO - Implement this
		throw new Error('UnsignedInteger64Nodes not implemented');

		return {
			type: NodeTypes.UINT64,
			value: BigInt(0)
		};
	}

	#readDoubleNode(): DoubleNode {
		// TODO - Implement this
		throw new Error('DoubleNodes not implemented');

		return {
			type: NodeTypes.DOUBLE,
			value: 0
		};
	}

	#readNullNode(): NullNode {
		// TODO - Implement this
		throw new Error('NullNodes not implemented');

		return {
			type: NodeTypes.NULL,
			value: null
		};
	}

	toJSON(): RootNode {
		return this.rootNode;
	}
}