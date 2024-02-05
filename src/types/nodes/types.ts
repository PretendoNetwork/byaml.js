export enum NodeTypes {
	STRING =                 0xA0, // * Any version
	BINARY_DATA =            0xA1, // * Versions 1 and 4+
	BINARY_DATA_WITH_PARAM = 0xA2, // * Version 5
	ARRAY =                  0xC0, // * Any version
	DICTIONARY =             0xC1, // * Any version
	STRING_TABLE =           0xC2, // * Any version
	BINARY_TABLE =           0xC3, // * Version 1
	BOOL =                   0xD0, // * Any version
	INT32 =                  0xD1, // * Any version
	FLOAT =                  0xD2, // * Any version
	UINT32 =                 0xD3, // * Versions 2+
	INT64 =                  0xD4, // * Versions 3+
	UINT64 =                 0xD5, // * Versions 3+
	DOUBLE =                 0xD6, // * Versions 3+
	NULL =                   0xFF, // * Any version
};