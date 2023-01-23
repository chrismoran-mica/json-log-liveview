# json-log-liveview

> Powerful terminal based viewer for JSON logs using blessed.

**json-log-viewer** is a feature intensive viewer and analyze tool for JSON logs created by applications that utilize structured logging.

Features:

- completely operated by hotkeys
- powerful command line arguments
- sort by any visible field
- filter by any field or metadata
- search

Hotkeys:

- `arrows` and `page up/down` to move
- `/` to search
- `n` to search again
- `s` to sort
- `f` to filter
- `l` to filter by level
- `g` to go to line
- `0` to go to first line
- `$` to go to last line
- `q` to quit

## Install

```bash
npm install --global json-log-viewer
```

## Usage

```bash
jv application.log.2017-01-01 --sort -timestamp
```

### Configuration

The default expected log format include fields `timestamp`, `level` and `message`. If the log file you're trying to parse doesn't include those fields, you can create a config file on your HOME path called `json-log-liveview.config.json`.

For example, if your log lines look like this:

```json
{
  "cid": "e3e3761c-a431-4fa0-ad7d-34aa2a6426a8",
  "message":
    "Matched route \"**_heartbeat_check\" (parameters: \"_controller\": \"**\\Controller\\**Controller::heartbeatCheckAction\", \"_route\": \"**_heartbeat_check\")",
  "context": [],
  "level": 200,
  "level_name": "INFO",
  "channel": "request",
  "datetime": {
    "date": "2017-12-06 09:23:42.253060",
    "timezone_type": 3,
    "timezone": "Europe/Berlin"
  },
  "extra": []
}
```

You can create a configuration like this:

```json
{
  "mapping": {
    "timestamp": {
      "key": "time",
      "format": "(time) => new Date(time).toLocaleDateString('en-US', { day: '2-digit', year: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })"
    },
    "level": "level",
    "message": {
      "key": "msg",
      "format": [
        "(msg, entry) => {",
        "if (entry.sql) {",
        "return msg + ': ' + entry.sql;",
        "} else if (entry.method && entry.req_type) {",
        "return entry.req_type + ': ' + entry.method;",
        "} else {",
        "return msg;",
        "}",
        "}"
      ]
    },
    "cid": {
      "key": "cid",
      "format": "(cid) => cid !== undefined ? cid : 'N/A'"
    },
    "data": "$"
  },
  "visibleFields": [
    "timestamp",
    "level",
    "cid",
    "message"
  ],
  "logLevels": {
    "trace": 10,
    "debug": 20,
    "info": 30,
    "warn": 40,
    "error": 50,
    "fatal": 60
  },
  "debug": false,
  "sort": "-timestamp",
  "interval": false
}
```

Note the `format` key within the `mapping` object. This represents a function that takes two parameters: `value`, `entry`. `value` is the value of the log entry at `key`, `entry` is the log entry itself. `format` enables custom handling of any value within the log entry.

`format` can be a `string` or `string[]`. If `format` is a `string[]` it is `.join(' ')`ed before conversion to a function. (The intention of allowing `string[]` is solely for readability wihin the config)

`format` and the function it generates shares the same restrictions as any other dynamic function:

* only has access to the global scope and parameters passed into it
* no access to local context

This way the messages will properly be displayed. The `$` has a special meaning: it indicates that the the raw structured log object should be included on the `data` key on the resulting JSON. 

## License

[MIT](LICENSE)
