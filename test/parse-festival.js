const BYAML = require('../');

const festival = new BYAML(`${__dirname}/Festival.byml`);

console.log(JSON.stringify(festival.rootNode, null, 4));