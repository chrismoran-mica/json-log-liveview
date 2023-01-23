const minimist = require('minimist');
const path = require('path');
const os = require('os');
const fs = require('fs');

function setFlag (obj, name, val, def) {
  if (val !== undefined) {
    if (typeof val === 'string') {
      obj[name] = val;
    } else if (val && def) {
      obj[name] = def;
    }
  }
}

const CONFIG_NAME = 'json-log-liveview.config.json';

const globalConfigPath = path.join(os.homedir(), CONFIG_NAME);
let globalConfig = {};
if (fs.existsSync(globalConfigPath)) {
/* @TODO: should this file be protected against abuse?
  fs.accessSync(globalConfigPath, fs.constants.R_OK);
  const stat = fs.statSync(globalConfigPath);
  if ((stat.mode & (fs.constants.S_IROTH | fs.constants.S_IWOTH | fs.constants.S_IXOTH | fs.constants.S_IRGRP | fs.constants.S_IWGRP | fs.constants.S_IXGRP)) !== 0) {
    console.error(`permissions too broad: ${Number(stat.mode).toString(8)} for ${globalConfigPath} must not be accessible by GRP or OTH.`);
    process.exit(0);
  }
*/
  globalConfig = JSON.parse(fs.readFileSync(globalConfigPath));
}

const localConfigPath = path.join(process.cwd(), CONFIG_NAME);
let localConfig = {};
if (fs.existsSync(localConfigPath)) {
  localConfig = JSON.parse(fs.readFileSync(localConfigPath));
}

const defaultConfig = {
  mapping: {
    timestamp: {
      key: 'time',
      format: 'time => new Date(time).toLocaleDateString(\'en-US\', { day: \'2-digit\', year: \'2-digit\', month: \'2-digit\', hour: \'2-digit\', minute: \'2-digit\', second: \'2-digit\' })',
    },
    level: 'level',
    message: 'msg',
    data: '$',
  },
  visibleFields: [
    'timestamp',
    'level',
    'message',
  ],
  logLevels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    warning: 40,
    error: 50,
    fatal: 60,
  },
  debug: false,
  level: null,
  sort: '-timestamp',
  interval: false,
};

const config = {
  ...defaultConfig,
  ...globalConfig,
  ...localConfig,
};

const opts = minimist(process.argv.slice(2));

config.logFile = opts._[0];
if (!config.logFile) {
  console.log('Error: Missing log file.');
  process.exit(1);
}

setFlag(config, 'debug', opts.d || opts.debug, './log');
setFlag(config, 'level', opts.l || opts.level);
setFlag(config, 'sort', opts.s || opts.sort);
setFlag(config, 'interval', opts.i || opts.interval, true);

module.exports = config;
