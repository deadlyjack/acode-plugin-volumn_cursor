import plugin from '../plugin.json';
import KeyboardEvent from './keyboardEvent';

const appSettings = acode.require('settings');

const keyMapping = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
};

class AcodePlugin {
  TO_LEFT = 'to left';
  TO_RIGHT = 'to right';
  TO_UP = 'to up';
  TO_DOWN = 'to down';

  KEY_LEFT = 37;
  KEY_UP = 38;
  KEY_RIGHT = 39;
  KEY_DOWN = 40;
  lastActiveElement = null;

  constructor() {
    if (!appSettings[plugin.id]) {
      appSettings[plugin.id] = {
        direction: this.TO_RIGHT,
      };

    }
    this.removeListeners = this.removeListeners.bind(this);
    this.addListeners = this.addListeners.bind(this);
    this.onvolumndown = this.onvolumndown.bind(this);
    this.onvolumnup = this.onvolumnup.bind(this);
    this.update = this.update.bind(this);
  }

  async init() {
    document.addEventListener('focusin', this.update);
  }

  async destroy() {
    this.removeListeners();
    document.removeEventListener('focusin', this.update);
  }

  update() {
    this.removeListeners();
    if (this.isEditable) {
      this.addListeners();
    }
  }

  removeListeners() {
    document.removeEventListener('volumeupbutton', this.onvolumnup);
    document.removeEventListener('volumedownbutton', this.onvolumndown);
  }

  addListeners() {
    document.addEventListener('volumeupbutton', this.onvolumnup);
    document.addEventListener('volumedownbutton', this.onvolumndown);
  }

  onvolumndown() {
    let key = this.KEY_RIGHT;

    switch (this.direction) {
      case this.TO_LEFT:
        key = this.KEY_LEFT;
        break;
      case this.TO_RIGHT:
        key = this.KEY_RIGHT;
        break;
      case this.TO_UP:
        key = this.KEY_UP;
        break;
      case this.TO_DOWN:
        key = this.KEY_DOWN;
        break;
    }

    this.dispatchKey(key);
  }

  onvolumnup() {
    let key = this.KEY_LEFT;

    switch (this.direction) {
      case this.TO_LEFT:
        key = this.KEY_RIGHT;
        break;
      case this.TO_RIGHT:
        key = this.KEY_LEFT;
        break;
      case this.TO_UP:
        key = this.KEY_DOWN;
        break;
      case this.TO_DOWN:
        key = this.KEY_UP;
        break;
    }

    this.dispatchKey(key);
  }

  dispatchKey(which) {
    const keyEvent = KeyboardEvent('keydown', {
      type: 'keydown',
      key: keyMapping[which],
      keyCode: which,
      which,
    });

    console.log(keyEvent);
    document.activeElement.dispatchEvent(keyEvent);
  }

  get isEditable() {
    return document.activeElement instanceof HTMLTextAreaElement
      || document.activeElement instanceof HTMLInputElement
      || document.activeElement.isContentEditable;
  }

  get settingsObj() {
    return {
      list: [
        {
          key: 'direction',
          text: 'Direction',
          value: this.settings.direction,
          select: [
            this.TO_LEFT,
            this.TO_RIGHT,
            this.TO_UP,
            this.TO_DOWN,
          ]
        }
      ],
      cb: (key, value) => {
        this.settings[key] = value;
        appSettings.update();
      },
    }
  }

  get settings() {
    return appSettings[plugin.id];
  }

  get direction() {
    return this.settings.direction || this.TO_RIGHT;
  }
}

if (window.acode) {
  const acodePlugin = new AcodePlugin();
  acode.setPluginInit(plugin.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    acodePlugin.init($page, cacheFile, cacheFileUrl);
  }, acodePlugin.settingsObj);
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
