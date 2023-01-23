const fs = require('fs');
const _ = require('lodash');

const config = require('./config');

const last = {
  timestamp: undefined,
};

function transform (entry) {
  const _entry = Object.keys(config.mapping).reduce((result, key) => {
    const value = mappingContext(key);
    result[value.key] = value.value(entry);
    if (value.key === 'timestamp') {
      last[value.key] = result[value.key];
    }
    return result;
  }, {});

  //@TODO: tie this back in!
  const levelMapping = mappingContext('level');
  _entry.levelFilter = _.invert(config.logLevels)[levelMapping.value(entry)];
  return _entry;
}

function mappingContext(key) {
  if (typeof config.mapping[key] === 'string' && config.mapping[key].indexOf('return') !== -1) {
    const fn = new Function(key, 'return ' + config.mapping[key])();
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
  return { key, value: (x) => _.get(x, key) };
}

function parse (line) {
  try {
    return transform(JSON.parse(line));
  } catch (e) {
    return {
      timestamp: last.timestamp,
      message: line,
      level: 'parse',
      data: {
        raw: line,
      },
    };
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
