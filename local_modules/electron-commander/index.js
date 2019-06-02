const path = require('path');
const resourcesDir = path.join(__dirname, '../../../');
const script = path.join(resourcesDir, '/app.asar.unpacked/node_modules/commander/index.js'); // Electron asar対策
const fs = require('fs');
let useScript;
var exist = function (file) {
  try {
    fs.statSync(file);
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
  }
}
if (exist(script)) {
  useScript = require(script);
} else {
  useScript = require('commander');
}
module.exports = useScript;