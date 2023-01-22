const fs = require('fs');
const _ = require('lodash');

const config = require('./config');

function transform (entry) {
  const _entry = Object.keys(config.mapping).reduce((result, key) => {
    const value = config.mapping[key];
    if (value === '$') {
      result[key] = _.cloneDeep(entry);
    } else {
      result[key] = _.get(entry, value);
    }
    return result;
  }, {});

  _entry.__$levelFilter = _.invert(config.logLevels)[entry.level];
  return _entry;
}

function parse (line) {
  try {
    return transform(JSON.parse(line));
  } catch (e) {
    return null;
  }
}

function readLogAsync (file, callback) {
  fs.readFile(file, (err, data) => {
    const contents = data.toString();
    const lines = _.compact(contents.split('\n').filter(line => line).map(parse));
    callback(err, lines.map(line => {
      const result = _.pick(line, config.visibleFields);
      const data = _.omit(line, config.visibleFields);
      return Object.assign({}, result, { ...data });
    }));
  });
}

function watchLog (file, callback) {
  fs.watch(file, (event) => {
    if (event === 'change') {
      readLogAsync(file, callback);
    }
  });
}

module.exports = { readLogAsync, transform, watchLog };
