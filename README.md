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
    "timestamp": "datetime.date",
    "level": "level_name",
    "message": "message",
    "cid": "return cid !== undefined ? cid : 'N/A'",
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

This way the messages will properly be displayed. The `$` has a special meaning: it indicates that the the raw structured log object should be included on the `data` key on the resulting JSON. 

## License

[MIT](LICENSE)
