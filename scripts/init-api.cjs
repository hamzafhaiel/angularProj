const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const database = path.join(root, 'db.json');
if (!fs.existsSync(database)) {
  fs.copyFileSync(path.join(root, 'db.seed.json'), database, fs.constants.COPYFILE_EXCL);
  console.log('Created db.json from the sample conferences.');
}
