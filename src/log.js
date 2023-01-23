const fs = require('fs');
const _ = require('lodash');

const config = require('./config');

const fLogLevel = '__$logLevel';

const last = {
  timestamp: undefined,
};

function transform (entry) {
  // noinspection UnnecessaryLocalVariableJS
  const _entry = Object.keys(config.mapping).reduce((result, key) => {
    const { format } = mappingContext(key);
    result[key] = format(entry);
    if (key === 'timestamp') {
      last[key] = result[key];
    }
    return result;
  }, {});

  _entry[fLogLevel] = config.logLevels[_entry.level];
  return _entry;
}

function mappingContext(key) {
  if (typeof config.mapping[key] === 'object') {
    const {key: mkey, format} = config.mapping[key];
    const fn = format ? new Function(mkey, 'return ' + (typeof format === 'object' ? format.join(' ') : format))() : (x) => x;
    return {
      format: x => fn(_.get(x, mkey), x),
    };
  } else if (typeof config.mapping[key] === 'string') {
    if (config.mapping[key] === '$') {
      return {
        format: (x) => _.cloneDeep(x),
      };
    } else {
      return {
        format: (x) => _.get(x, config.mapping[key]),
      };
    }
  }
  return {
    format: (x) => _.get(x, key),
  };
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

module.exports = { readLogAsync, transform, watchLog, fLogLevel };
