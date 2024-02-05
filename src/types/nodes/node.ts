import { NodeTypes } from '@/types/nodes/types';

export default interface Node {
	type: NodeTypes.STRING | NodeTypes.BINARY_DATA | NodeTypes.BINARY_DATA_WITH_PARAM | NodeTypes.ARRAY | NodeTypes.DICTIONARY | NodeTypes.STRING_TABLE | NodeTypes.BINARY_TABLE | NodeTypes.BOOL | NodeTypes.INT32 | NodeTypes.FLOAT | NodeTypes.UINT32 | NodeTypes.INT64 | NodeTypes.UINT64 | NodeTypes.DOUBLE | NodeTypes.NULL;
	value: unknown;
};