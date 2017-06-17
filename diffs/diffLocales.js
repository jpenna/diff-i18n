const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const rimraf = require('rimraf');

const filePath = path.join(__dirname, 'translate');
rimraf.sync(filePath);
fs.mkdirSync(filePath);

let filenames = fs.readdirSync(path.resolve(__dirname, '../'));
filenames = _.pull(filenames, 'flatten', 'index.js', 'diffs');

const langs = {};

filenames.forEach((file) => {
  const lang = require(`../${file}`);
  langs[file] = lang;
});

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        if (!target[key]) Object.assign(target, { [key]: `${source[key]} ***` });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function createDiffFile(file) {
  const copy = Object.assign({}, langs[file]);

  return _.reduce(langs, (result, lang, current) => {
    if (file === current) return result;
    return mergeDeep(copy, langs[current]);
  }, copy);
}

_.each(langs, (lang, file) => {
  const diff = createDiffFile(file);
  const write = JSON.stringify(diff, null, 2);
  fs.writeFileSync(path.join(filePath, file + 'on'), write);
})
