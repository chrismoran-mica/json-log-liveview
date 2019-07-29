const minimist = require('minimist')
const path = require('path')
const os = require('os')
const fs = require('fs')

function setFlag (obj, name, val, def) {
  if (val !== undefined) {
    if (typeof val === 'string') {
      obj[name] = val
    } else if (val && def) {
      obj[name] = def
    }
  }
}

const CONFIG_NAME = 'json-log-liveview.config.json'

const globalConfigPath = path.join(os.homedir(), CONFIG_NAME)
let globalConfig = {}
if (fs.existsSync(globalConfigPath)) {
  globalConfig = JSON.parse(fs.readFileSync(globalConfigPath))
}

const localConfigPath = path.join(process.cwd(), CONFIG_NAME)
let localConfig = {}
if (fs.existsSync(localConfigPath)) {
  localConfig = JSON.parse(fs.readFileSync(localConfigPath))
}

const config = {
  mapping: {
    timestamp: 'time',
    level: 'level',
    message: 'msg',
    data: '$'
  },
  visibleFields: [
    'timestamp',
    'level',
    'message'
  ],
  logLevels: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  },
  debug: false,
  sort: '-timestamp',
  interval: false,
  ...globalConfig,
  ...localConfig
}

const opts = minimist(process.argv.slice(2))

config.logFile = opts._[0]
if (!config.logFile) {
  console.log('Error: Missing log file.')
  process.exit(1)
}

setFlag(config, 'debug', opts.d || opts.debug, './log')
setFlag(config, 'level', opts.l || opts.level)
setFlag(config, 'sort', opts.s || opts.sort)
setFlag(config, 'interval', opts.i || opts.interval, true)

module.exports = config
