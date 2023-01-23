const blessed = require('blessed');
const BaseWidget = require('./BaseWidget');

class Picker extends BaseWidget {
  constructor (parent = null, opts = {}) {
    super(Object.assign({}, opts, {
      parent,
      top: 'center',
      left: 'center',
      width: 'shrink',
      height: 'shrink',
      shadow: true,
      padding: 1,
      style: {
        border: {
          fg: 'red',
        },
        header: {
          fg: 'blue',
          bold: true,
        },
        cell: {
          fg: 'magenta',
          selected: {
            bg: 'blue',
          },
        },
      },
    }));
    this.items = opts.items;
    this.label = opts.label || 'Select item';
    this.keySelect = !!opts.keySelect;
    this.tabMode = !!opts.tabMode;
    if (this.tabMode) {
      this.modes = ['', '(at least)', '(at most)'];
      this.mode = 0;
    }
    this.update();
  }

  update () {
    this.setLabel(`{bold} ${this.label} {/}`);
    this.list = blessed.list({
      interactive: true,
      keys: true,
      style: {
        selected: {
          bg: 'white',
          fg: 'black',
          bold: true,
        },
      },
    });
    this.list.on('focus', () => this.log('focus'));
    this.list.on('blur', () => this.log('blur'));
    this.list.on('keypress', this.handleKeyPressed.bind(this));
    this.list.on('select', this.handleSelected.bind(this));
    this.list.setItems(this.items);
    this.append(this.list);
  }

  handleSelected (err, value) {
    if (this.tabMode) {
      this.selected({ item: this.items[value], mode: this.mode });
    } else {
      this.selected(this.items[value]);
    }
  }

  selected (value) {
    this.list.detach();
    this.detach();
    this.screen.render();
    this.emit('select', null, value);
  }

  handleKeyPressed (ch, key) {
    if (this.keySelect && /[a-z]/.test(ch)) {
      const item = this.items.find(i => i.startsWith(ch));
      if (item) {
        this.log('item', item);
        this.selected(item);
      }
    }

    if (key.name === 'escape') {
      this.selected(null);
    }

    if (this.tabMode && key.name === 'tab') {
      this.mode = (this.mode + 1) % this.modes.length;
      this.setLabel(`{bold} ${this.label} ${this.modes[this.mode]}{/}`);
      this.screen.render();
    }
  }

  setCurrent () {
    this.list.focus();
    this.screen.render();
    return this;
  }
}

module.exports = Picker;
