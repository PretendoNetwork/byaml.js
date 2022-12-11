const fs = require('fs');

function getDataFromPathOrBuffer(pathOrBuffer) {
	let data;
	if (pathOrBuffer instanceof Buffer) {
		data = pathOrBuffer;
	} else {
		data = fs.readFileSync(pathOrBuffer);
	}

	return data;
}

module.exports = {
	getDataFromPathOrBuffer
};