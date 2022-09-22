import tag from 'html-tag-js';
import plugin from '../plugin.json';

const keyMapping = {
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
};

class AcodePlugin {
  constructor() {
    this.removeListeners = this.removeListeners.bind(this);
    this.addListners = this.addListners.bind(this);
    this.onvolumndown = this.onvolumndown.bind(this);
    this.onvolumnup = this.onvolumnup.bind(this);
  }

  async init() {
    const { editor } = editorManager;
    editor.on('focus', this.addListners);
    editor.on('blur', this.removeListeners);
  }

  async destroy() {
    const { editor } = editorManager;
    editor.off('focus', this.addListners);
    editor.off('blur', this.removeListeners);
    document.removeEventListener('volumeupbutton', this.onvolumnup);
    document.removeEventListener('volumedownbutton', this.onvolumndown);
  }

  removeListeners() {
    document.removeEventListener('volumeupbutton', this.onvolumnup);
    document.removeEventListener('volumedownbutton', this.onvolumndown);
  }

  addListners() {
    document.addEventListener('volumeupbutton', this.onvolumnup);
    document.addEventListener('volumedownbutton', this.onvolumndown);
  }

  onvolumndown() {
    this.dispatchKey(37);
  }

  onvolumnup() {
    this.dispatchKey(39)
  }

  dispatchKey(which) {
    const { editor } = editorManager;
    const shiftKey = tag.get('#shift-key')?.dataset.state === 'on'
    const $textarea = editor.textInput.getElement();
    const keyevent = window.createKeyboardEvent('keydown', {
      key: keyMapping[which],
      keyCode: which,
      shiftKey,
    });

    $textarea.dispatchEvent(keyevent);
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
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}