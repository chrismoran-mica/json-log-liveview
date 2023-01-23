const _ = require('lodash');

const COLOR_TAG_REGEX = /{\/?[\w\-,;!#]+}/g;
const formatRows = (rows, columns, spacing = 1, maxWidth) => {
  const formatted = rows.map(row => {
    const newRow = {};
    for (const column of columns) {
      const { format, key } = column;
      const rawValue = row[key];
      let value = row[key] ? row[key] : '';
      try {
        value = _.isFunction(format) ? format(rawValue) : value;
      } finally {
        newRow[key] = value;
      }
    }
    return newRow;
  });

  const lengths = maxLengths(columns, formatted, spacing, maxWidth);

  return formatted.map(row => {
    return columns.map(column => {
      const { key, format } = column;
      return padEnd(row[key], lengths[key], !format);
    }).join(spaces(spacing));
  });
};

const maxLengths = (columns, arr, spacing, maxWidth) => {
  const lengths = arr.reduce((map, row) => {
    columns.slice(0, -1).forEach(col => {
      const val = row[col.key] || '';
      map[col.key] = Math.max(map[col.key] || 0, len(val.toString()));
    });
    return map;
  }, {});
  const lastCol = _.last(columns);
  const width = _.chain(lengths).values().sum().value() + (spacing * Object.keys(lengths).length);
  lengths[lastCol.key] = maxWidth - width;
  return lengths;
};

const hasColors = (text) => {
  return COLOR_TAG_REGEX.test(text);
};

const stripColors = (text) => {
  if (typeof text === 'string') {
    return (text || '').toString().replace(COLOR_TAG_REGEX, '').replace(/\{\/}/g, '');
  }
  return text;
};

const len = (text, ignoreColors = false) => {
  if (!text) {
    return 0;
  }
  if (ignoreColors) {
    return text.length;
  }
  return stripColors(text).length;
};

const spaces = (n) => new Array(n + 1).join(' ');

const padEnd = (text, length, ignoreColors = false) => {
  const nSpaces = length - len(text, ignoreColors);
  if (nSpaces < 0) {
    return trunc(text, length, ignoreColors);
  }
  return `${text}${spaces(nSpaces)}`;
};

const trunc = (text, length, ignoreColors = false) => {
  if (!text) { return ''; }
  if (ignoreColors || !hasColors(text)) {
    return text.substring(0, length);
  }
  if (len(text, ignoreColors) <= length) {
    return text;
  }

  let curLen = 0;
  let isTag = false;
  let output = '';
  let i = 0;
  while (curLen < length) {
    const ch = text.charAt(i);
    output += ch;
    if (ch === '{') {
      isTag = true;
    }
    if (!isTag) {
      curLen += 1;
    }
    if (ch === '}') {
      isTag = false;
    }
    i += 1;
  }

  return `${output}{/}`;
};

const levelColors = {
  debug: s => `{green-fg}${s}{/}`,
  info: s => `{cyan-fg}{bold}${s}{/bold}{/}`,
  warn: s => `{yellow-fg}${s}{/}`,
  warning: s => `{yellow-fg}${s}{/}`,
  parse: s => `{gray-fg}${s}{/}`,
  error: s => `{red-fg}${s}{/}`,
};

module.exports = { formatRows, maxLengths, hasColors, stripColors, spaces, padEnd, len, trunc, levelColors };
