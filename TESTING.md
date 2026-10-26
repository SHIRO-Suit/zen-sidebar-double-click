# Real-browser acceptance checklist

Use a disposable Zen profile with Sine, then repeat on the normal setup.
Record the Zen version, Sine version, OS and other enabled mods in bug reports.

- [x] Window restored: double-click empty space below tabs → maximized.
- [x] Window maximized: same gesture → previous size and position.
- [x] Native draggable area: one double click causes exactly one transition.
- [ ] Drag the same blank space: Zen still moves the window and Windows snaps it.
- [ ] Double-click tabs: Zen's configured tab behavior remains unchanged.
- [ ] Double-click new-tab, workspace, media and window buttons: no extra maximize.
- [ ] Double-click folder names: renaming/collapsing keeps its normal behavior.
- [ ] Double-click the address bar: text selection still works.
- [ ] Right/middle click, modifier double-clicks: no mod action.
- [ ] F11 fullscreen, browser customization: no mod action.
- [ ] Sidebar left/right, expanded/collapsed, compact mode: repeat blank-area checks.
- [ ] A second browser window works independently.
- [ ] Restart after disabling/uninstalling: no mod action remains.
- [ ] Repeat with Magnetic Sidebar, Zia or other installed sidebar modifications.

The illustration in `docs/cover.svg` is not a browser acceptance-test screenshot.

## Verification record — 2026-10-26

Zen 1.23.4b / Gecko 158.0.1, Windows, disposable profile, default sidebar.
The source script was injected in the browser chrome through Marionette's
privileged execution context. WebDriver pointer double-clicks produced trusted
events targeting `.zen-workspace-empty-space`; window states changed from
`STATE_NORMAL (3)` to `STATE_MAXIMIZED (1)` and back to `3`.

Native double-clicks injected through Computer Use were then tested on that
same blank sidebar region: the window maximized to the monitor and restored to
its original size on the second double click. No second, unwanted toggle was
observed. This verifies the gesture, not Sine installation or theme combinations.

GitHub Actions also passed syntax validation and all 18 unit tests.
