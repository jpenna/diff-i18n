const flat = require('flat');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');

let filenames = fs.readdirSync(__dirname);
filenames = _.pull(filenames, 'flatten', 'index.js', 'diffs');

const filePath = path.join(__dirname, 'flatten');
if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

filenames.forEach((file) => {
  const lang = require(`./${file}`);
  const name = file.replace(/\.js$/, '');
  const flatten = flat(lang);
  const write = JSON.stringify(flatten);
  fs.writeFileSync(path.join(`${filePath}/${name}.json`), write);
});
