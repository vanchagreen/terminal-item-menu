var keypress = require('keypress');
var colors = require('colors');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
const readline = require('readline');

/*
options: {
  items: [
    {
      onSelect?: () => void;
      value: string;
      text: string;
    }
  ];
  header?: string;
  onQuit?: () => void;
  promisify: boolean;
  startIndex?: number;
}
 */

function Menu(options) {
  EventEmitter.call(this);

  this.items = options.items;
  this.index = options.startIndex || 0;

  this.userOnQuit = options.onQuit;
  this.promisify = options.promisify;
  this.header = options.header;

  this._searching = false;
  this._searchText = '';
  this._searchItem = null;
  this._oldSearchItem = null;

  this._init();
}

Menu.prototype._init = function () {
  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  this._initListeners();
}

Menu.prototype.start = function () {

  if (this.header) {
    var dividerLength = Math.max.apply(null, this.items.map(item => item.text.length)) + 2;
    var divider = Array(dividerLength + 1).join('-');
    process.stdout.write(this.header + '\n' + divider + '\n')
  }

  this._draw();

  if (this.promisify) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.on('resolve', function (value) {
        resolve(value);
      });

      self.on('reject', function () {
        reject();
      });
    })
  }
}

Menu.prototype._draw = function () {
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  readline.clearScreenDown(process.stdout);

  if (!this._searching) {
    var itemText = this.items[this.index].text;
    var arrow = '';

    if (this.index === this.items.length - 1) {
      arrow = '↑';
    } else if (this.index === 0) {
      arrow = '↓'
    } else {
      arrow = '⇵';
    }
    process.stdout.write(arrow + ' ' + itemText + '\n');
    readline.moveCursor(process.stdout, 0, -1);
  } else {

    const preText = 'searching: ';
    var itemText;

    if (this._searchItem) {
      var searchItemText = this._searchItem.text;
      var index = searchItemText.indexOf(this._searchText);
      itemText = searchItemText.substr(0, index) +
        this._searchText.underline +
        searchItemText.substr(index + this._searchText.length)
    } else {
      itemText = this._oldSearchItem.text;
    }
    process.stdout.write(itemText + '\n');
    process.stdout.write(preText + this._searchText + '_');

    var currentX = preText.length + 2 + (this._searchText ? this._searchText.length : 0);
    readline.moveCursor(process.stdout, -1 * currentX, -1);

    if (this._searchItem) {
      const index = this._searchItem.text.indexOf(this._searchText);
      readline.moveCursor(process.stdout, index, 0);
    }

  }


}

Menu.prototype._initListeners = function () {
  var self = this;
  process.stdin.on('keypress', function (ch, key) {

    var keyChar = (key && key.name) || ch;
    if (key && key.shift) {
      keyChar = keyChar.toUpperCase();
    }

    if (!keyChar || !keyChar.length) {
      return;
    }

    if (keyChar === 'up') {
      if (!self._searching) {
        self._onUp();
      }
    } else if (keyChar === 'down') {
      if (!self._searching) {
        self._onDown();
      }
    } else if (keyChar === 'return') {
      self._onEnter();
    } else if (keyChar === 'escape' || (keyChar === 'c' && key && key.ctrl)) {
      if (self._searching) {
        self._toggleSearch();
      } else {
        self._onQuit();
      }
    } else if (key && key.ctrl && (keyChar === 's' || keyChar === 'r')) {
      if (self._searching) {
        self._onSearchAgain();
      } else {
        self._toggleSearch();
      }
    } else if ((keyChar.length === 1 || keyChar === 'space') && !(key && (key.meta || key.ctrl))) {
      if (self._searching) {
        self._onSearchLetter(keyChar !== 'space' ? keyChar : ' ');
      }
    } else if (keyChar === 'backspace') {
      if (self._searching) {
        self._onBackspace();
      }
    }
  })
}

Menu.prototype._toggleSearch = function () {
  this._searching = !this._searching;
  this._searchText = '';
  this._searchItem = null;
  this._oldSearchItem = this.items[this.index];
  this._draw();
}

function searchItems(items, searchText, oldItem) {
  const foundItem = items.find(function (item) {
    return item.text.indexOf(searchText) !== -1 && item !== oldItem;
  });

  return foundItem ? foundItem : oldItem;
}

Menu.prototype._onSearchLetter = function (c) {
  this._searchText += c;
  if (this._searchItem) {
    this._oldSearchItem = this._searchItem;
  }
  this._searchItem = searchItems(this.items, this._searchText, null)
  this._draw();
}

Menu.prototype._onBackspace = function (c) {
  this._searchText = this._searchText.slice(0, -1);
  this._searchItem = searchItems(this.items, this._searchText, null)
  this._draw();
}

Menu.prototype._onSearchAgain = function () {
  if (this._searchItem) {
    this._oldSearchItem = this._searchItem;
  }

  this._searchItem = searchItems(this.items, this._searchText, this._searchItem)
  this._draw();
}

Menu.prototype._onUp = function () {
  if (this.index === 0) {
    return;
  }
  this.index = this.index - 1;
  this._draw();
}

Menu.prototype._onDown = function () {
  if (this.index === this.items.length - 1) {
    return;
  }
  this.index = this.index + 1;
  this._draw();
}

Menu.prototype._onEnter = function () {
  var selectedItem;
  if (this._searching) {
    selectedItem = this._searchItem || this._oldSearchItem;
  } else {
    selectedItem = this.items[this.index];
  }

  process.stdout.write('\n');
  if (selectedItem.onSelect) {
    selectedItem.onSelect(selectedItem.value);
  }
  if (this.promisify) {
    this.emit('resolve', selectedItem.value);
  }
  this._onExit();
}

Menu.prototype._onExit = function () {
  this._cleanKeypress();
}

Menu.prototype._onQuit = function () {
  process.stdout.write('\n');
  if (this.userOnQuit) {
    this.userOnQuit();
  }
  this.emit('reject');
  this._onExit();
}

//TODO: think about multiple menus...

Menu.prototype._cleanKeypress = function () {
  process.stdin.pause();
}

util.inherits(Menu, EventEmitter);

module.exports = function (opts) {
  return new Menu(opts || {});
}