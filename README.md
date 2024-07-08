# byaml.js
TypeScript library for interacting with, and creating, [BYAML](https://github.com/Kinnay/Nintendo-File-Formats/wiki/BYAML-File-Format) files

## Deprecated
## See https://github.com/PretendoNetwork/nintendo-file-formats

## Install
```bash
npm i @pretendonetwork/byaml
```

## Example
```ts
import BYAML from '@pretendonetwork/byaml';

const byaml = new BYAML();

byaml.parseFromFile('./WeaponInfo_Main.byaml');

console.log(JSON.stringify(byaml.rootNode, null, 4));
```

## Support
- [ ] Encoding
- [x] Reading from file paths
- [ ] String node
- [ ] Binary data node
- [ ] Binary data node with param
- [x] Array node
- [x] Dictionary node
- [x] String table node
- [x] Binary table node
- [ ] Bool node
- [ ] Int32 node
- [ ] Float node
- [ ] Uint32 node
- [ ] Int64 node
- [ ] Uint64 node
- [ ] Double node
- [ ] Null node
