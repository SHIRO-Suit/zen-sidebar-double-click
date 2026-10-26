// ==UserScript==
// @name           Sidebar Double Click
// @description    Maximize or restore Zen by double-clicking unused sidebar space.
// @include        main
// ==/UserScript==

(() => {
  "use strict";

  const win = window;
  const doc = win.document;
  if (doc.documentURI !== "chrome://browser/content/browser.xhtml") return;
  // Sine may reload a script in an existing window.
  win.zenSidebarDoubleClick?.destroy();

  const sidebar = [
    "#TabsToolbar",
    "#zen-sidebar-top-buttons",
    "#zen-sidebar-foot-buttons",
  ].join(",");
  const controls = [
    "tab", "button", "toolbarbutton", "toolbaritem", "input", "textarea",
    "textbox", "select", "a", "menu", "menuitem", "menupopup", "panel",
    "splitter", "scrollbar", "slider", "[contenteditable]:not([contenteditable='false'])",
    "[role='button']", "[role='tab']", "[role='link']", "[role='textbox']",
    "[command]", "[onclick]", "[ondblclick]", "[data-action]", "[draggable='true']",
    ".tabbrowser-tab", ".tab-group-label-container", "tab-group > label",
    "#zen-workspaces-button", ".zen-workspace-icon", ".zen-workspace-header",
    "#zen-essentials", "#zen-media-controls-toolbar", ".titlebar-buttonbox-container",
  ].join(",");
  // Only accept known background containers, never arbitrary custom widgets.
  const background = [
    "#TabsToolbar", "#TabsToolbar-customization-target", "#tabbrowser-tabs",
    "#zen-tabs-wrapper", "#tabbrowser-arrowscrollbox", ".arrowscrollbox-scrollbox",
    ".zen-workspace-empty-space", ".zen-workspace-tabs-section",
    "#zen-sidebar-top-buttons", "#zen-sidebar-top-buttons-customization-target",
    "#zen-sidebar-foot-buttons", ".toolbar-items", "spacer", "toolbarspring",
  ].join(",");
  let pending = null;

  function onDoubleClick(event) {
    if (!event.isTrusted || event.defaultPrevented || event.button !== 0 ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        win.fullScreen || doc.documentElement.hasAttribute("customizing")) return;
    const target = event.composedPath()[0];
    if (!target?.matches || target.ownerDocument !== doc ||
        !target.closest(sidebar) || target.closest(controls) || !target.matches(background)) return;
    if (![win.STATE_NORMAL, win.STATE_MAXIMIZED].includes(win.windowState)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    const maximize = win.windowState !== win.STATE_MAXIMIZED;
    if (pending !== null) win.clearTimeout(pending);
    // Windows also handles double clicks in native draggable regions. Wait for
    // that handling, then converge on a fixed state instead of toggling twice.
    pending = win.setTimeout(() => {
      pending = null;
      if (win.closed || win.fullScreen) return;
      if (maximize && win.windowState === win.STATE_NORMAL) win.maximize();
      else if (!maximize && win.windowState === win.STATE_MAXIMIZED) win.restore();
    }, 0);
  }

  function destroy() {
    win.removeEventListener("dblclick", onDoubleClick, true);
    win.removeEventListener("unload", destroy);
    if (pending !== null) win.clearTimeout(pending);
    delete win.zenSidebarDoubleClick;
  }
  win.zenSidebarDoubleClick = { destroy };
  win.addEventListener("dblclick", onDoubleClick, true);
  win.addEventListener("unload", destroy, { once: true });
})();
