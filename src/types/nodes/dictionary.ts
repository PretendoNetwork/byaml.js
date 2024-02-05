import Node from '@/types/nodes/node';

export type DictionaryNode = {
	type: 0xC1;
	value: Record<string, Node>;
};