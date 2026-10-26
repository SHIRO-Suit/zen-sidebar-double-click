const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(`${__dirname}/../sidebar-double-click.uc.js`, 'utf8');

function setup({ state = 3, interactive = false, background = true, sidebar = true } = {}) {
  const handlers = new Map();
  const timers = new Map();
  let sequence = 0;
  const doc = {
    documentURI: 'chrome://browser/content/browser.xhtml',
    documentElement: { hasAttribute: () => false },
  };
  const win = {
    document: doc, STATE_NORMAL: 3, STATE_MAXIMIZED: 1, windowState: state,
    fullScreen: false, closed: false, calls: [],
    maximize() { this.calls.push('maximize'); this.windowState = 1; },
    restore() { this.calls.push('restore'); this.windowState = 3; },
    setTimeout(fn) { timers.set(++sequence, fn); return sequence; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(type, fn) { handlers.set(type, fn); },
    removeEventListener(type, fn) { if (handlers.get(type) === fn) handlers.delete(type); },
  };
  const target = {
    ownerDocument: doc,
    matches: () => background,
    closest: (selector) => selector.includes('#TabsToolbar') ? sidebar : interactive,
  };
  const event = {
    isTrusted: true, button: 0, composedPath: () => [target],
    preventDefault() { this.defaultPrevented = true; },
    stopImmediatePropagation() { this.stopped = true; },
  };
  const context = vm.createContext({ window: win });
  vm.runInContext(source, context);
  return { win, doc, event, target, handlers,
    fire: () => handlers.get('dblclick')?.(event),
    flush() { for (const fn of timers.values()) fn(); timers.clear(); },
    reload: () => vm.runInContext(source, context),
  };
}

test('empty sidebar double click maximizes, then restores', () => {
  const app = setup();
  app.fire(); app.flush();
  assert.deepEqual(app.win.calls, ['maximize']);
  app.fire(); app.flush();
  assert.deepEqual(app.win.calls, ['maximize', 'restore']);
});

for (const state of [3, 1]) {
  test(`native window handling does not toggle twice from state ${state}`, () => {
    const app = setup({ state });
    app.fire();
    app.win.windowState = state === 3 ? 1 : 3;
    app.flush();
    assert.deepEqual(app.win.calls, []);
  });
}

for (const options of [{ interactive: true }, { background: false }, { sidebar: false }, { state: 2 }]) {
  test(`ignores unsupported target/state ${JSON.stringify(options)}`, () => {
    const app = setup(options);
    app.fire(); app.flush();
    assert.deepEqual(app.win.calls, []);
    assert.equal(app.event.defaultPrevented, undefined);
  });
}

for (const override of [
  { isTrusted: false }, { button: 1 }, { button: 2 }, { defaultPrevented: true },
  { altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true },
]) {
  test(`ignores event ${JSON.stringify(override)}`, () => {
    const app = setup(); Object.assign(app.event, override);
    app.fire(); app.flush(); assert.deepEqual(app.win.calls, []);
  });
}

test('ignores fullscreen, customization, foreign documents, and closed windows', () => {
  for (const change of [
    app => { app.win.fullScreen = true; },
    app => { app.doc.documentElement.hasAttribute = () => true; },
    app => { app.target.ownerDocument = {}; },
  ]) {
    const app = setup(); change(app); app.fire(); app.flush();
    assert.deepEqual(app.win.calls, []);
  }
  const app = setup(); app.fire(); app.win.closed = true; app.flush();
  assert.deepEqual(app.win.calls, []);
});

test('reload cleans up pending actions and unload removes listeners', () => {
  const app = setup(); app.fire(); app.reload(); app.flush();
  assert.deepEqual(app.win.calls, []);
  app.fire(); app.flush(); assert.deepEqual(app.win.calls, ['maximize']);
  app.handlers.get('unload')();
  assert.equal(app.handlers.size, 0);
  assert.equal(app.win.zenSidebarDoubleClick, undefined);
});

test('manifest points to the shipped script and only browser windows', () => {
  const manifest = JSON.parse(readFileSync(`${__dirname}/../theme.json`));
  assert.equal(manifest.version, require('../package.json').version);
  assert.deepEqual(manifest.scripts['sidebar-double-click.uc.js'].include,
    ['chrome://browser/content/browser.xhtml']);
});
