#!/usr/bin/env node
const blessed = require('blessed');
require('./polyfills');

const MainPanel = require('./widgets/MainPanel');
const StatusLine = require('./widgets/StatusLine');

const config = require('./config');

const screen = blessed.screen({
  smartCSR: true,
  log: config.debug,
});

screen.key(['C-c'], function (_ch, _key) {
  return process.exit(0);
});

const mainPanel = new MainPanel({ screen, config });

const statusLine = new StatusLine({ screen, mainPanel });
screen.append(statusLine);
mainPanel.setCurrent();

screen.render();

process.on('SIGWINCH', function () {
  screen.emit('resize');
});
