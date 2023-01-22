const fs = require('fs');
const _ = require('lodash');

const config = require('./config');

function transform (entry) {
  const _entry = Object.keys(config.mapping).reduce((result, key) => {
    const value = mappingContext(key);
    result[value.key] = value.value(entry);
    return result;
  }, {});

  //@TODO: tie this back in!
  _entry.__$levelFilter = _.invert(config.logLevels)[entry.level];
  return _entry;
}

function mappingContext(key) {
  if (typeof config.mapping[key] === 'string' && config.mapping[key].indexOf('return') === 0) {
    const fn = new Function('context', config.mapping[key]);
    return {
      key,
      value: x => fn(_.get(x, key)),
    };
  } else if (typeof config.mapping[key] === 'string') {
    if (config.mapping[key] === '$') {
      return {
        key,
        value: (x) => _.cloneDeep(x),
      };
    } else {
      return {
        key,
        value: (x) => _.get(x, config.mapping[key]),
      };
    }
  }
  return { key, value: (x) => x };
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
